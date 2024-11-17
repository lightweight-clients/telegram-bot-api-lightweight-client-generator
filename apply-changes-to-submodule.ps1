# Copy files
Copy-Item -Recurse -Force output/output/* ./client/src/
Copy-Item -Force output/openapi.json ./client/schema/openapi.json

# Setup environment
cd ./client
$version = (Get-Content ./schema/openapi.json | ConvertFrom-Json).info.version
git checkout -b "release/$version"

# Update changelog
$updateText = "
## $version

Initial release of the new version $version."

$changelog = Get-Content ./CHANGELOG.md
$changelog[4] = $updateText, $changelog[4]
$changelog | Set-Content ./CHANGELOG.md

# Commit changes
git add .
git commit -m "Support API v$version"

# Update version in package.json
npm version $version --no-git-tag-version
