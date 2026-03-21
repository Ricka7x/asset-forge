#!/bin/bash
# Usage: ./release.sh <version>
# Example: ./release.sh 1.2.3
#
# This script:
#   1. Bumps the version in package.json and src/banner.ts
#   2. Builds the binary to confirm it compiles
#   3. Commits, tags, and pushes — triggering the GitHub Actions release

set -e

VERSION="${1:?'Usage: ./release.sh <version>  e.g. ./release.sh 1.2.3'}"

# Validate semver format
if ! [[ "$VERSION" =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
  echo "Error: version must be in semver format (e.g. 1.2.3)"
  exit 1
fi

echo "Preparing release v$VERSION..."

# Bump version in package.json
sed -i '' "s/\"version\": \"[^\"]*\"/\"version\": \"$VERSION\"/" package.json

# Bump version in src/banner.ts
sed -i '' "s/const VERSION = '[^']*'/const VERSION = '$VERSION'/" src/banner.ts

# Build to verify it compiles cleanly
echo "Building..."
bun run build

echo "Committing and tagging..."
git add package.json src/banner.ts
git commit -m "chore: release v$VERSION"
git tag "v$VERSION"
git push origin main "v$VERSION"

REPO=$(git remote get-url origin | sed 's/.*github.com[:/]//' | sed 's/.git$//')
echo ""
echo "Released v$VERSION."
echo "GitHub Actions is now building the binaries and updating the Homebrew formula."
echo "Monitor: https://github.com/$REPO/actions"
