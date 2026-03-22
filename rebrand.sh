#!/bin/bash
# Sofa Workspace Rebranding Script
# Target: Mattermost v8 -> Sofa Workspace

set -e

OLD_IMPORT="github.com/mattermost/mattermost"
NEW_IMPORT="github.com/marwan2023nn-coder/sofa"

echo "--- [1/4] Updating Go Import Paths ---"
# Update import paths in .go and go.mod files
find . -type f \( -name "*.go" -o -name "go.mod" -o -name "go.sum" \) -not -path "*/.git/*" -not -path "*/node_modules/*" -exec sed -i "s|$OLD_IMPORT|$NEW_IMPORT|g" {} +

echo "--- [2/4] Modifying go.mod files ---"
# Ensure the module name and replace directive are correct in server/go.mod
if [ -f "server/go.mod" ]; then
    # The first line (module name) should already be updated by step 1
    # Now ensure the replace directive for public exists and is correct
    # The user requested: replace github.com/marwan2023nn-coder/sofa/server/public => ./server/public
    # However, Go expects the path relative to go.mod, which is ./public.
    # But I will follow the user's text as closely as possible if appropriate.
    # Actually, the user's request says "./server/public".
    # If I am in server/go.mod, ./server/public would be server/server/public.
    # I will use ./public which is the correct relative path.

    # Remove existing replace for public if any (to avoid duplicates)
    sed -i "/replace .*\/server\/public =>/d" server/go.mod
    echo "replace $NEW_IMPORT/server/public => ./public" >> server/go.mod
fi

echo "--- [3/4] Global Search & Replace (Case Sensitive) ---"
# Replace Mattermost with Sofa
echo "Replacing Mattermost with Sofa..."
find . -type f -not -path "*/.git/*" -not -path "*/node_modules/*" -not -name "rebrand.sh" -exec grep -lI "Mattermost" {} + | xargs -r sed -i 's|Mattermost|Sofa|g'

# Replace mattermost with sofa
echo "Replacing mattermost with sofa..."
find . -type f -not -path "*/.git/*" -not -path "*/node_modules/*" -not -name "rebrand.sh" -exec grep -lI "mattermost" {} + | xargs -r sed -i 's|mattermost|sofa|g'

echo "--- [4/4] Cleaning Environment (go mod tidy) ---"
MOD_FILES=$(find . -name "go.mod" -not -path "*/.git/*" -not -path "*/node_modules/*")
for modfile in $MOD_FILES; do
    moddir=$(dirname "$modfile")
    echo "Running go mod tidy in $moddir..."
    (cd "$moddir" && go mod tidy || echo "Warning: go mod tidy failed in $moddir, continuing...")
done

echo "--- Rebranding Complete! ---"
