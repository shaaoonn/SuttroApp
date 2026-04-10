import { google, drive_v3 } from 'googleapis';
import { Readable } from 'stream';

// ─────────────────────────────────────────────
// Google Drive Integration for Suttro App
//
// Architecture:
//   - OAuth2 refresh token authenticates as the user's own Google account
//   - Files stored in user's Google Drive (5TB quota)
//   - "Anyone with link" permission for app access
//   - Folders auto-organized: content/{date}/{subject}/
//                              submissions/{date}/{student}/
//   - Auto-cleanup of files older than 30 days
//
// Setup:
//   1. Google Cloud Console → Create OAuth2 credentials
//   2. Get refresh token via OAuth Playground
//   3. Set env vars: GOOGLE_OAUTH_CLIENT_ID, GOOGLE_OAUTH_CLIENT_SECRET,
//                    GOOGLE_OAUTH_REFRESH_TOKEN, GOOGLE_DRIVE_ROOT_FOLDER_ID
// ─────────────────────────────────────────────

let driveClient: drive_v3.Drive | null = null;

function getOAuth2Client() {
  const clientId = process.env.GOOGLE_OAUTH_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_OAUTH_CLIENT_SECRET;
  const refreshToken = process.env.GOOGLE_OAUTH_REFRESH_TOKEN;

  if (!clientId || !clientSecret || !refreshToken) {
    throw new Error(
      'Google OAuth2 credentials not configured. Set GOOGLE_OAUTH_CLIENT_ID, GOOGLE_OAUTH_CLIENT_SECRET, and GOOGLE_OAUTH_REFRESH_TOKEN'
    );
  }

  const oauth2 = new google.auth.OAuth2(clientId, clientSecret);
  oauth2.setCredentials({ refresh_token: refreshToken });
  return oauth2;
}

function getDrive(): drive_v3.Drive {
  if (driveClient) return driveClient;
  const auth = getOAuth2Client();
  driveClient = google.drive({ version: 'v3', auth });
  return driveClient;
}

function getRootFolderId(): string {
  const id = process.env.GOOGLE_DRIVE_ROOT_FOLDER_ID;
  if (!id) throw new Error('GOOGLE_DRIVE_ROOT_FOLDER_ID not configured');
  return id;
}

// ── Folder Management ──

/** Get or create a folder by name under a parent folder */
async function getOrCreateFolder(name: string, parentId: string): Promise<string> {
  const drive = getDrive();

  // Search for existing folder
  const res = await drive.files.list({
    q: `name='${name}' and '${parentId}' in parents and mimeType='application/vnd.google-apps.folder' and trashed=false`,
    fields: 'files(id, name)',
    spaces: 'drive',
  });

  if (res.data.files && res.data.files.length > 0) {
    return res.data.files[0].id!;
  }

  // Create new folder
  const folder = await drive.files.create({
    requestBody: {
      name,
      parents: [parentId],
      mimeType: 'application/vnd.google-apps.folder',
    },
    fields: 'id',
  });

  return folder.data.id!;
}

/** Build folder path: root → type → date → (subject or student) */
async function ensureFolderPath(segments: string[]): Promise<string> {
  let parentId = getRootFolderId();
  for (const segment of segments) {
    parentId = await getOrCreateFolder(segment, parentId);
  }
  return parentId;
}

// ── File Operations ──

export interface UploadResult {
  fileId: string;
  fileName: string;
  mimeType: string;
  /** Direct image URL (for images) */
  directUrl: string;
  /** Google Drive view URL */
  viewUrl: string;
  /** Download URL */
  downloadUrl: string;
  size: number;
}

/** Detect MIME type from file extension */
function getMimeType(filename: string): string {
  const ext = filename.toLowerCase().split('.').pop() || '';
  const mimeMap: Record<string, string> = {
    jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png',
    gif: 'image/gif', webp: 'image/webp', svg: 'image/svg+xml',
    pdf: 'application/pdf',
    mp4: 'video/mp4', webm: 'video/webm', mov: 'video/quicktime',
    mp3: 'audio/mpeg', wav: 'audio/wav', ogg: 'audio/ogg',
    doc: 'application/msword',
    docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  };
  return mimeMap[ext] || 'application/octet-stream';
}

/**
 * Upload a file to Google Drive
 * @param buffer - File content as Buffer
 * @param filename - Original filename
 * @param folderPath - Array of folder segments: ['content', '2026-04-10', 'physics']
 * @param mimeType - Optional MIME type override
 */
export async function uploadFile(
  buffer: Buffer,
  filename: string,
  folderPath: string[],
  mimeType?: string,
): Promise<UploadResult> {
  const drive = getDrive();
  const resolvedMime = mimeType || getMimeType(filename);

  // Ensure folder structure exists
  const folderId = await ensureFolderPath(folderPath);

  // Upload file
  const res = await drive.files.create({
    requestBody: {
      name: filename,
      parents: [folderId],
    },
    media: {
      mimeType: resolvedMime,
      body: Readable.from(buffer),
    },
    fields: 'id, name, mimeType, size, webViewLink, webContentLink',
  });

  const fileId = res.data.id!;

  // Make file accessible to anyone with the link
  await drive.permissions.create({
    fileId,
    requestBody: {
      role: 'reader',
      type: 'anyone',
    },
  });

  return {
    fileId,
    fileName: res.data.name || filename,
    mimeType: res.data.mimeType || resolvedMime,
    directUrl: `https://lh3.googleusercontent.com/d/${fileId}`,
    viewUrl: `https://drive.google.com/file/d/${fileId}/preview`,
    downloadUrl: `https://drive.google.com/uc?id=${fileId}&export=download`,
    size: parseInt(res.data.size || '0', 10),
  };
}

/**
 * Upload admin content (PDFs, images, videos) for daily lessons
 * Folder: content/{date}/{subject}/
 */
export async function uploadContent(
  buffer: Buffer,
  filename: string,
  date: string,
  subjectId?: string,
): Promise<UploadResult> {
  const path = ['content', date];
  if (subjectId) path.push(subjectId);
  return uploadFile(buffer, filename, path);
}

/**
 * Upload student submission photo
 * Folder: submissions/{date}/{studentName}/
 */
export async function uploadSubmission(
  buffer: Buffer,
  filename: string,
  date: string,
  studentName: string,
): Promise<UploadResult> {
  // Sanitize student name for folder name
  const safeName = studentName.replace(/[^\w\s\u0980-\u09FF-]/g, '').trim() || 'unknown';
  return uploadFile(buffer, filename, ['submissions', date, safeName]);
}

/** Delete a file from Google Drive */
export async function deleteFile(fileId: string): Promise<void> {
  const drive = getDrive();
  await drive.files.delete({ fileId });
}

/** Delete multiple files */
export async function deleteFiles(fileIds: string[]): Promise<void> {
  const drive = getDrive();
  await Promise.all(fileIds.map(id => drive.files.delete({ fileId: id }).catch(() => {})));
}

/** Get file metadata */
export async function getFileInfo(fileId: string) {
  const drive = getDrive();
  const res = await drive.files.get({
    fileId,
    fields: 'id, name, mimeType, size, webViewLink, createdTime',
  });
  return res.data;
}

/** Download a file as Buffer (for AI processing) */
export async function downloadFile(fileId: string): Promise<Buffer> {
  const drive = getDrive();
  const res = await drive.files.get(
    { fileId, alt: 'media' },
    { responseType: 'arraybuffer' },
  );
  return Buffer.from(res.data as ArrayBuffer);
}

// ── Cleanup ──

/**
 * Delete all files and folders older than N days
 * Call this from a cron job daily
 */
export async function cleanupOldFiles(olderThanDays: number = 30): Promise<{
  deletedFolders: number;
  errors: string[];
}> {
  const drive = getDrive();
  const rootId = getRootFolderId();
  let deletedFolders = 0;
  const errors: string[] = [];

  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);

  // Check both 'content' and 'submissions' top-level folders
  for (const topFolder of ['content', 'submissions']) {
    try {
      // Find the top-level folder
      const topRes = await drive.files.list({
        q: `name='${topFolder}' and '${rootId}' in parents and mimeType='application/vnd.google-apps.folder' and trashed=false`,
        fields: 'files(id)',
      });

      const topId = topRes.data.files?.[0]?.id;
      if (!topId) continue;

      // List date folders inside
      const dateFolders = await drive.files.list({
        q: `'${topId}' in parents and mimeType='application/vnd.google-apps.folder' and trashed=false`,
        fields: 'files(id, name)',
        pageSize: 100,
      });

      for (const folder of dateFolders.data.files || []) {
        const folderDate = new Date(folder.name || '');
        if (isNaN(folderDate.getTime())) continue;

        if (folderDate < cutoffDate) {
          try {
            // Trash the entire date folder (and all children)
            await drive.files.update({
              fileId: folder.id!,
              requestBody: { trashed: true },
            });
            deletedFolders++;
          } catch (err: unknown) {
            errors.push(`Failed to delete ${topFolder}/${folder.name}: ${err instanceof Error ? err.message : String(err)}`);
          }
        }
      }
    } catch (err: unknown) {
      errors.push(`Failed to process ${topFolder}: ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  return { deletedFolders, errors };
}

/**
 * Check if Google Drive is configured and working
 */
export async function checkConnection(): Promise<{ ok: boolean; error?: string }> {
  try {
    const drive = getDrive();
    const rootId = getRootFolderId();

    await drive.files.get({
      fileId: rootId,
      fields: 'id, name',
    });

    return { ok: true };
  } catch (err: unknown) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : 'Unknown error',
    };
  }
}

/**
 * Get URL for serving a file based on its type
 */
export function getServeUrl(fileId: string, mimeType: string): string {
  if (mimeType.startsWith('image/')) {
    return `https://lh3.googleusercontent.com/d/${fileId}`;
  }
  if (mimeType === 'application/pdf' || mimeType.startsWith('video/')) {
    return `https://drive.google.com/file/d/${fileId}/preview`;
  }
  return `https://drive.google.com/uc?id=${fileId}&export=download`;
}

/**
 * Check if Google Drive is configured
 */
export function isDriveConfigured(): boolean {
  return !!(
    process.env.GOOGLE_OAUTH_CLIENT_ID &&
    process.env.GOOGLE_OAUTH_CLIENT_SECRET &&
    process.env.GOOGLE_OAUTH_REFRESH_TOKEN &&
    process.env.GOOGLE_DRIVE_ROOT_FOLDER_ID
  );
}
