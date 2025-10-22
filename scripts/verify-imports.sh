#!/bin/bash

# 깨진 import가 있는지 확인
echo "🔍 Checking for broken imports..."

# TypeScript 컴파일 체크
npx tsc --noEmit

if [ $? -eq 0 ]; then
  echo "✅ All imports are valid!"
else
  echo "❌ Found TypeScript errors. Check above output."
  exit 1
fi
