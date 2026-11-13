#!/usr/bin/env bash
# Kept for older instructions; the build itself is scripts/build-extension.mjs.
set -e
cd "$(dirname "$0")/.."
node scripts/build-extension.mjs
