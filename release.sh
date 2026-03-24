#!/bin/bash
# Usage: ./release.sh <version> [--retry]
# Example: ./release.sh 1.2.3
#          ./release.sh 1.2.3 --retry   # re-triggers the same tag after a failed CI run

set -e

VERSION="${1:?'Usage: ./release.sh <version>  e.g. ./release.sh 1.2.3'}"
RETRY=false
[[ "${2}" == "--retry" ]] && RETRY=true

# Validate semver format
if ! [[ "$VERSION" =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
  echo "Error: version must be in semver format (e.g. 1.2.3)"
  exit 1
fi

if $RETRY; then
  echo "Retrying release v$VERSION..."
  git tag -d "v$VERSION" 2>/dev/null || true
  git push origin ":refs/tags/v$VERSION" 2>/dev/null || true
  git tag "v$VERSION"
  git push origin "v$VERSION"
  REPO=$(git remote get-url origin | sed 's/.*github.com[:/]//' | sed 's/.git$//')
  echo ""
  echo "Re-triggered v$VERSION."
  echo "Monitor: https://github.com/$REPO/actions"
  exit 0
fi

echo "Preparing release v$VERSION..."

# Bump version in package.json
sed -i '' "s/\"version\": \"[^\"]*\"/\"version\": \"$VERSION\"/" package.json

# Build to verify it compiles cleanly
echo "Building..."
bun run build

echo "Committing and tagging..."
git add package.json
git diff --staged --quiet || git commit -m "chore: release v$VERSION"
git tag "v$VERSION"
git push origin main "v$VERSION"

REPO=$(git remote get-url origin | sed 's/.*github.com[:/]//' | sed 's/.git$//')
echo ""
echo "Released v$VERSION."
echo "GitHub Actions is now building the binaries and updating the Homebrew formula."
echo "Monitor: https://github.com/$REPO/actions"
