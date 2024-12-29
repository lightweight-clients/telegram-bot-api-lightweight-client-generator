#!/bin/sh
set -e

tmp_image="telegram-bot-api-lightweight-client-generator:latest"
tmp_container="telegram-bot-api-lightweight-client-generator"

echo "Cleaning up output folder"
rm -rf output

echo "Building $tmp_image"
docker build -t "$tmp_image" --progress=plain .

echo "Copying results"
docker container create --name "$tmp_container" "$tmp_image"
docker cp "$tmp_container":/results ./output

echo "Removing $tmp_image and $tmp_container"
docker container rm "$tmp_container"
docker image rm "$tmp_image"

echo "Done"
