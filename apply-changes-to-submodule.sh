#!/bin/bash
set -e

# Arguments
version=$1

echo "Copying files"
cp -r ../output/output/* ./src/
cp ../output/openapi.json ./schema/openapi.json

echo "Updating changelog"
updateText="## $version\n\nInitial release of the new version $version."
changelog=$(<./CHANGELOG.md)
echo -e "$updateText\n\n$changelog" > ./CHANGELOG.md
echo "Changelog updated: $updateText"

echo "Updating version in package.json"
npm version "$version.0" --no-git-tag-version

echo "Committing changes"
git add .
git commit -m "Support API v$version"
