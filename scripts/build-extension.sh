#!/usr/bin/env bash
set -e
cd "$(dirname "$0")/.."

VERSION=$(node -p "require('./extension/manifest.json').version")
ZIP="tabos-extension-v${VERSION}.zip"

echo "→ Building TabOS extension v${VERSION}"

echo "→ Cleaning old hashed assets…"
rm -rf extension/assets

echo "→ Building extension bundle…"
(cd extension-src && bunx vite build)

# Rename index.html → newtab.html (Chrome MV3 new-tab override)
if [ -f extension/index.html ]; then
  mv -f extension/index.html extension/newtab.html
fi
rm -f extension/favicon.ico

echo "→ Packaging zip…"
mkdir -p public
rm -f public/tabos-extension*.zip
(cd extension && nix run nixpkgs#zip -- -qr "/dev-server/public/${ZIP}" .)

echo "✓ public/${ZIP} ($(du -h "public/${ZIP}" | cut -f1))"
