"""
Upload AAB to Google Play Internal Testing track via the Android Publisher API.

Workflow:
  1. Create a new edit
  2. Upload the AAB (returns versionCode)
  3. Configure the internal testing track with that versionCode
  4. Add release notes
  5. Commit the edit (atomically applies all the above)

Run: python scripts/play/upload_internal.py
"""
import sys
import json
from pathlib import Path

sys.stdout.reconfigure(encoding="utf-8")

ROOT = Path(__file__).resolve().parents[2]
KEY_PATH = ROOT / ".secrets" / "play-publisher-key.json"
AAB_PATH = ROOT / "android" / "app" / "build" / "outputs" / "bundle" / "release" / "app-release.aab"
PACKAGE_NAME = "app.suttro.suttro"
SCOPES = ["https://www.googleapis.com/auth/androidpublisher"]

RELEASE_NAME = "1.0.2 — Sim toolbar restoration"
RELEASE_NOTES_BN = (
    "সিমুলেশন পেজে এখন উপরে ব্যাক বাটন এবং পেজের নাম যোগ হয়েছে — "
    "অন্যান্য পেজের মতো স্ট্যান্ডার্ড নেভিগেশন। "
    "গতি সিমুলেশনে ফুলস্ক্রিন ভিউতে ডানে compact rail-এ "
    "সমস্ত সূত্র, derivation এবং graph দেখা যাবে।"
)


def main() -> int:
    if not KEY_PATH.exists():
        print(f"[ERR] Key file missing: {KEY_PATH}")
        return 1
    if not AAB_PATH.exists():
        print(f"[ERR] AAB missing: {AAB_PATH}")
        return 1

    from google.oauth2 import service_account
    from googleapiclient.discovery import build
    from googleapiclient.errors import HttpError
    from googleapiclient.http import MediaFileUpload

    creds = service_account.Credentials.from_service_account_file(
        str(KEY_PATH), scopes=SCOPES
    )
    svc = build("androidpublisher", "v3", credentials=creds, cache_discovery=False)
    edits = svc.edits()

    print(f"AAB: {AAB_PATH} ({AAB_PATH.stat().st_size / 1024 / 1024:.2f} MB)")
    print(f"Package: {PACKAGE_NAME}")
    print()

    edit_id = None
    try:
        # 1. Create edit
        edit = edits.insert(packageName=PACKAGE_NAME, body={}).execute()
        edit_id = edit["id"]
        print(f"[1/4] Edit created: {edit_id}")

        # 2. Upload AAB
        media = MediaFileUpload(
            str(AAB_PATH),
            mimetype="application/octet-stream",
            resumable=True,
            chunksize=5 * 1024 * 1024,
        )
        request = edits.bundles().upload(
            packageName=PACKAGE_NAME, editId=edit_id, media_body=media
        )
        print("[2/4] Uploading AAB...")
        response = None
        while response is None:
            status, response = request.next_chunk()
            if status:
                pct = status.progress() * 100
                print(f"        {pct:.1f}%")
        version_code = response["versionCode"]
        sha1 = response.get("sha1")
        sha256 = response.get("sha256")
        print(f"        Done. versionCode={version_code}")
        print(f"        Bundle SHA-1:   {sha1}")
        print(f"        Bundle SHA-256: {sha256}")

        # 3. Assign bundle to internal testing track with release notes
        track_body = {
            "track": "internal",
            "releases": [
                {
                    "name": RELEASE_NAME,
                    "status": "draft",   # 'draft' first; promote_internal.py rolls out
                    "versionCodes": [str(version_code)],
                    "releaseNotes": [
                        {"language": "bn-BD", "text": RELEASE_NOTES_BN},
                    ],
                }
            ],
        }
        edits.tracks().update(
            packageName=PACKAGE_NAME, editId=edit_id, track="internal", body=track_body
        ).execute()
        print(f"[3/4] Internal testing track configured (status=draft)")

        # 4. Commit
        edits.commit(packageName=PACKAGE_NAME, editId=edit_id).execute()
        print(f"[4/4] Edit committed.")
        edit_id = None  # don't try to delete on cleanup

        print()
        print("Success! AAB is uploaded to Internal Testing as a DRAFT.")
        print("Next: review in Play Console then promote draft -> completed (or use a follow-up script).")
        return 0

    except HttpError as e:
        print(f"\n[ERR] HttpError {e.resp.status}")
        try:
            err = json.loads(e.content.decode())
            print(json.dumps(err, indent=2, ensure_ascii=False))
        except Exception:
            print(e.content.decode("utf-8", errors="replace"))
        return 2
    finally:
        if edit_id:
            try:
                edits.delete(packageName=PACKAGE_NAME, editId=edit_id).execute()
                print(f"[cleanup] Deleted draft edit {edit_id}")
            except HttpError:
                pass


if __name__ == "__main__":
    raise SystemExit(main())
