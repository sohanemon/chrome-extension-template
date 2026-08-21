#!/usr/bin/env bash
set -euo pipefail

SRC="public/icon.png"
OUTDIR="public/generated"

if [ ! -f "$SRC" ]; then
  echo "Error: '$SRC' not found — place your icon at public/icon.png"
  exit 1
fi

mkdir -p "$OUTDIR"

for SIZE in 16 48 128; do
  OUT="$OUTDIR/icon-${SIZE}.png"
  magick "$SRC" -resize "${SIZE}x${SIZE}" "$OUT"
  echo "  ✓ $OUT ($(du -h "$OUT" | cut -f1))"
done

echo "Done. Icons in $OUTDIR/"
