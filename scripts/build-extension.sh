#!/usr/bin/env bash
set -e
cd "$(dirname "$0")/.."

echo "→ Building extension bundle…"
bunx vite build --config extension-src/vite.config.ts

# Flatten output: vite writes html at extension/extension-src/newtab.html
if [ -f extension/extension-src/newtab.html ]; then
  mv -f extension/extension-src/newtab.html extension/newtab.html
  rm -rf extension/extension-src
fi

# Strip stray favicon copy
rm -f extension/favicon.ico

# Fix asset paths in newtab.html — vite emits ./assets/... but
# after the flatten the html is one level up so paths already match.
echo "→ Packaging zip…"
mkdir -p public
rm -f public/tabos-extension.zip
cd extension
nix run nixpkgs#zip -- -qr /dev-server/public/tabos-extension.zip .
cd ..

echo "✓ public/tabos-extension.zip ($(du -h public/tabos-extension.zip | cut -f1))"
