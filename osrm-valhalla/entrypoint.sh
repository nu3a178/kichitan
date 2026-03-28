#!/bin/bash
set -e

LOCAL_DIR="/custom_files"
mkdir -p "$LOCAL_DIR"

echo "Copying tiles from GCS to local disk..."
gsutil -m cp -r "gs://${GCS_BUCKET}/*" "$LOCAL_DIR/"
echo "Copy complete."

exec /valhalla/scripts/docker-entrypoint.sh
