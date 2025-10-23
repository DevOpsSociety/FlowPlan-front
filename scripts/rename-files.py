#!/usr/bin/env python3
"""
파일명 변경 스크립트: kebab-case → PascalCase/camelCase
"""

import os
import re
from pathlib import Path

def to_pascal_case(kebab_str):
    """kebab-case를 PascalCase로 변환"""
    words = kebab_str.split('-')
    return ''.join(word.capitalize() for word in words)

def to_camel_case(kebab_str):
    """kebab-case를 camelCase로 변환"""
    words = kebab_str.split('-')
    if not words:
        return kebab_str
    return words[0] + ''.join(word.capitalize() for word in words[1:])

def find_files_to_rename():
    """변경할 파일 목록 생성"""
    renames = []

    # Next.js 예약 파일명
    RESERVED = {'page', 'layout', 'loading', 'error', 'not-found', 'route'}

    base_dirs = ['features', 'shared', 'app']

    for base_dir in base_dirs:
        if not os.path.exists(base_dir):
            continue

        # .tsx 파일 (컴포넌트) - PascalCase
        for tsx_file in Path(base_dir).rglob('*.tsx'):
            file_path = str(tsx_file)
            file_name = tsx_file.stem

            # Next.js 예약 파일 제외
            if file_name in RESERVED:
                continue

            # kebab-case 체크
            if '-' in file_name:
                new_name = to_pascal_case(file_name)
                new_path = str(tsx_file.parent / f"{new_name}.tsx")

                if file_path != new_path:
                    renames.append((file_path, new_path, 'Component'))

        # .ts 파일 (훅/유틸) - camelCase
        for ts_file in Path(base_dir).rglob('*.ts'):
            # .d.ts 파일 제외
            if ts_file.suffix == '.ts' and not str(ts_file).endswith('.d.ts'):
                file_path = str(ts_file)
                file_name = ts_file.stem

                # kebab-case 체크
                if '-' in file_name:
                    new_name = to_camel_case(file_name)
                    new_path = str(ts_file.parent / f"{new_name}.ts")

                    if file_path != new_path:
                        file_type = 'Hook' if file_name.startswith('use-') else 'Util'
                        renames.append((file_path, new_path, file_type))

    return renames

def main():
    print("=== 파일명 변경 분석 중 ===\n")

    renames = find_files_to_rename()

    if not renames:
        print("변경할 파일이 없습니다.")
        return

    # 결과 출력
    for old_path, new_path, file_type in renames:
        print(f"{file_type:10} {old_path} → {os.path.basename(new_path)}")

    print(f"\n=== 총 {len(renames)}개 파일 변경 예정 ===\n")

    # 매핑 파일 저장
    os.makedirs('scripts', exist_ok=True)
    with open('scripts/rename-map.txt', 'w') as f:
        for old_path, new_path, _ in renames:
            f.write(f"{old_path}|{new_path}\n")

    print("매핑 파일 저장: scripts/rename-map.txt")
    print("\n=== 파일명 변경 준비 완료 ===")
    print("실제 변경을 진행하려면: python3 scripts/apply-renames.py")

if __name__ == '__main__':
    main()
