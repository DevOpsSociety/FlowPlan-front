#!/bin/bash

# 사용법: ./scripts/migrate-files.sh <source> <destination>
# 예: ./scripts/migrate-files.sh components/wbs/wbs-table.tsx features/wbs/components/WBSTable.tsx

SOURCE=$1
DEST=$2

if [ ! -f "$SOURCE" ]; then
  echo "❌ Source file not found: $SOURCE"
  exit 1
fi

# 디렉토리 생성
mkdir -p "$(dirname "$DEST")"

# 파일 이동
mv "$SOURCE" "$DEST"
echo "✅ Moved: $SOURCE → $DEST"

# Git staging
git add "$DEST"
git add "$SOURCE" # 삭제 추적
