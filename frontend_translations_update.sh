#!/bin/bash
# Script to add useTranslation hook to pages that don't have it

echo "Adding i18n support to pages..."

# List of files to update (excluding SwapPageV2 which already has it)
FILES=(
  "/app/frontend/src/pages/LaunchpadPage.jsx"
  "/app/frontend/src/pages/NFTMintPage.jsx"
  "/app/frontend/src/pages/ReferralsPage.jsx"
  "/app/frontend/src/pages/PortfolioPage.jsx"
  "/app/frontend/src/pages/BridgePage.jsx"
  "/app/frontend/src/pages/ProjectsPage.jsx"
)

for file in "${FILES[@]}"; do
  if [ -f "$file" ]; then
    # Check if useTranslation is already imported
    if ! grep -q "useTranslation" "$file"; then
      echo "Processing: $file"
      # Add import after the first React import line
      sed -i "1a import { useTranslation } from 'react-i18next';" "$file"
      echo "  ✓ Added useTranslation import"
    else
      echo "Skipping: $file (already has useTranslation)"
    fi
  fi
done

echo "Done!"
