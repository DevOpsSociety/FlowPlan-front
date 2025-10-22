#!/bin/bash

# 파일명 변경 스크립트: kebab-case → PascalCase/camelCase

# kebab-case를 PascalCase로 변환하는 함수
to_pascal_case() {
  echo "$1" | sed -r 's/(^|-)([a-z])/\U\2/g'
}

# kebab-case를 camelCase로 변환하는 함수
to_camel_case() {
  echo "$1" | sed -r 's/-([a-z])/\U\1/g'
}

# 파일명 변경 매핑 저장
declare -A RENAMES

echo "=== 파일명 변경 분석 중 ==="

# .tsx 파일 (컴포넌트) - PascalCase로 변경
while IFS= read -r file; do
  dir=$(dirname "$file")
  base=$(basename "$file" .tsx)

  # Next.js 예약 파일은 제외
  if [[ "$base" =~ ^(page|layout|loading|error|not-found)$ ]]; then
    continue
  fi

  new_base=$(to_pascal_case "$base")
  new_file="$dir/$new_base.tsx"

  if [ "$file" != "$new_file" ]; then
    RENAMES["$file"]="$new_file"
    echo "Component: $file → $new_file"
  fi
done < <(find features shared app -name "*.tsx" -type f 2>/dev/null)

# .ts 파일 (훅/유틸) - camelCase로 변경
while IFS= read -r file; do
  dir=$(dirname "$file")
  base=$(basename "$file" .ts)

  # use로 시작하는 훅
  if [[ "$base" =~ ^use- ]]; then
    new_base=$(to_camel_case "$base")
  # 일반 유틸/서비스
  elif [[ "$base" =~ - ]]; then
    new_base=$(to_camel_case "$base")
  else
    # 이미 단일 단어면 변경 없음
    new_base="$base"
  fi

  new_file="$dir/$new_base.ts"

  if [ "$file" != "$new_file" ]; then
    RENAMES["$file"]="$new_file"
    echo "Hook/Util: $file → $new_file"
  fi
done < <(find features shared app -name "*.ts" -type f ! -name "*.d.ts" 2>/dev/null)

echo ""
echo "=== 총 ${#RENAMES[@]}개 파일 변경 예정 ==="
echo ""

# 변경 매핑을 파일로 저장
echo "=== 변경 매핑 저장 중 ==="
> scripts/rename-map.txt
for old_file in "${!RENAMES[@]}"; do
  echo "$old_file|${RENAMES[$old_file]}" >> scripts/rename-map.txt
done
echo "매핑 파일 저장: scripts/rename-map.txt"
echo ""

echo "=== 파일명 변경 준비 완료 ==="
echo "실제 변경을 진행하려면 scripts/apply-renames.sh를 실행하세요"
