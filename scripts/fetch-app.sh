#!/usr/bin/env bash
# Downloads the app under test (Sauce Labs "My Demo App" for Android) at a pinned
# version and verifies its checksum, so every run tests exactly the same build.
# The APK is never committed to this repository.
set -euo pipefail

VERSION="2.3.0"
FILE="mda-2.3.0-27.apk"
SHA256="bd3a3d6f2d50e076b2701ed2cc6a0ca82157b40a7033cf5be9f5d084b6591ec8"
URL="https://github.com/saucelabs/my-demo-app-android/releases/download/${VERSION}/${FILE}"

DEST_DIR="$(cd "$(dirname "$0")/.." && pwd)/apps"
DEST="${DEST_DIR}/my-demo-app.apk"
mkdir -p "$DEST_DIR"

if [ -f "$DEST" ] && echo "${SHA256}  ${DEST}" | sha256sum -c --status; then
  echo "App already present and verified: ${DEST}"
  exit 0
fi

echo "Downloading ${FILE} (My Demo App ${VERSION})"
curl -fsSL --retry 3 -o "$DEST" "$URL"
echo "${SHA256}  ${DEST}" | sha256sum -c -
echo "Saved to ${DEST}"
