#!/bin/bash

# 사용법: ./scripts/update-imports.sh <old-path> <new-path>
# 예: ./scripts/update-imports.sh "@/components/wbs/wbs-table" "@/features/wbs/components/WBSTable"

OLD_PATH=$1
NEW_PATH=$2

# Windows (Git Bash) - FlowPlan 프로젝트용
echo "🔄 Updating imports: $OLD_PATH → $NEW_PATH"

find . -type f \( -name "*.tsx" -o -name "*.ts" \) \
  -not -path "*/node_modules/*" \
  -not -path "*/.next/*" \
  -not -path "*/.git/*" \
  -exec sed -i "s|$OLD_PATH|$NEW_PATH|g" {} +

echo "✅ Import paths updated!"

# Linux/macOS 사용자는 위 sed -i를 sed -i ''로 변경:
# -exec sed -i '' "s|$OLD_PATH|$NEW_PATH|g" {} +
