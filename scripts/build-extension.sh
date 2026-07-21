#!/usr/bin/env bash
set -e
cd "$(dirname "$0")/.."

echo "→ Building extension bundle…"
(cd extension-src && bunx vite build)

# Rename index.html → newtab.html (Chrome MV3 new-tab override)
if [ -f extension/index.html ]; then
  mv -f extension/index.html extension/newtab.html
fi
# Strip stray files
rm -f extension/favicon.ico

echo "→ Packaging zip…"
mkdir -p public
rm -f public/tabos-extension.zip
(cd extension && nix run nixpkgs#zip -- -qr /dev-server/public/tabos-extension.zip .)

echo "✓ public/tabos-extension.zip ($(du -h public/tabos-extension.zip | cut -f1))"
