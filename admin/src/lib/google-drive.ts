import { google, drive_v3 } from 'googleapis';
import { Readable } from 'stream';

// ─────────────────────────────────────────────
// Google Drive for Admin Panel
// Shares the same service account as the main app
// ─────────────────────────────────────────────

let driveClient: drive_v3.Drive | null = null;

function getDrive(): drive_v3.Drive {
  if (driveClient) return driveClient;

  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const key = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY;

  if (!email || !key) {
    throw new Error('Google Drive credentials not configured');
  }

  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: email,
      private_key: key.replace(/\\n/g, '\n'),
    },
    scopes: ['https://www.googleapis.com/auth/drive'],
  });

  driveClient = google.drive({ version: 'v3', auth });
  return driveClient;
}

function getRootFolderId(): string {
  const id = process.env.GOOGLE_DRIVE_ROOT_FOLDER_ID;
  if (!id) throw new Error('GOOGLE_DRIVE_ROOT_FOLDER_ID not configured');
  return id;
}

async function getOrCreateFolder(name: string, parentId: string): Promise<string> {
  const drive = getDrive();
  const res = await drive.files.list({
    q: `name='${name}' and '${parentId}' in parents and mimeType='application/vnd.google-apps.folder' and trashed=false`,
    fields: 'files(id)',
    spaces: 'drive',
  });

  if (res.data.files && res.data.files.length > 0) {
    return res.data.files[0].id!;
  }

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

async function ensureFolderPath(segments: string[]): Promise<string> {
  let parentId = getRootFolderId();
  for (const seg of segments) {
    parentId = await getOrCreateFolder(seg, parentId);
  }
  return parentId;
}

function getMimeType(filename: string): string {
  const ext = filename.toLowerCase().split('.').pop() || '';
  const map: Record<string, string> = {
    jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png',
    gif: 'image/gif', webp: 'image/webp',
    pdf: 'application/pdf',
    mp4: 'video/mp4', webm: 'video/webm', mov: 'video/quicktime',
  };
  return map[ext] || 'application/octet-stream';
}

export interface UploadResult {
  fileId: string;
  fileName: string;
  mimeType: string;
  directUrl: string;
  viewUrl: string;
  downloadUrl: string;
  size: number;
}

/**
 * Upload admin content to Google Drive
 * Folder: content/{date}/{subject}/
 */
export async function uploadAdminContent(
  buffer: Buffer,
  filename: string,
  date: string,
  subjectId?: string,
): Promise<UploadResult> {
  const drive = getDrive();
  const mime = getMimeType(filename);

  const path = ['content', date];
  if (subjectId) path.push(subjectId);
  const folderId = await ensureFolderPath(path);

  const res = await drive.files.create({
    requestBody: {
      name: filename,
      parents: [folderId],
    },
    media: {
      mimeType: mime,
      body: Readable.from(buffer),
    },
    fields: 'id, name, mimeType, size',
  });

  const fileId = res.data.id!;

  // Public read access
  await drive.permissions.create({
    fileId,
    requestBody: { role: 'reader', type: 'anyone' },
  });

  return {
    fileId,
    fileName: res.data.name || filename,
    mimeType: res.data.mimeType || mime,
    directUrl: `https://lh3.googleusercontent.com/d/${fileId}`,
    viewUrl: `https://drive.google.com/file/d/${fileId}/preview`,
    downloadUrl: `https://drive.google.com/uc?id=${fileId}&export=download`,
    size: parseInt(res.data.size || '0', 10),
  };
}

/** Delete a file by ID */
export async function deleteAdminFile(fileId: string): Promise<void> {
  const drive = getDrive();
  await drive.files.delete({ fileId }).catch(() => {});
}

/** Check if Google Drive is configured */
export function isGDriveConfigured(): boolean {
  return !!(process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL &&
    process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY &&
    process.env.GOOGLE_DRIVE_ROOT_FOLDER_ID);
}
