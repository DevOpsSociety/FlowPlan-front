#!/usr/bin/env python3
"""
파일명 변경 및 import 경로 업데이트 스크립트
"""

import os
import re
import shutil
from pathlib import Path

def load_rename_map():
    """rename-map.txt에서 변경 매핑 로드"""
    renames = {}
    with open('scripts/rename-map.txt', 'r') as f:
        for line in f:
            old_path, new_path = line.strip().split('|')
            renames[old_path] = new_path
    return renames

def rename_files(renames):
    """실제 파일명 변경"""
    print("=== 파일명 변경 중 ===\n")

    for old_path, new_path in renames.items():
        if os.path.exists(old_path):
            print(f"Renaming: {old_path} → {os.path.basename(new_path)}")
            shutil.move(old_path, new_path)
        else:
            print(f"Warning: {old_path} not found")

    print(f"\n=== {len(renames)}개 파일 이름 변경 완료 ===\n")

def update_imports(renames):
    """모든 TypeScript 파일에서 import 경로 업데이트"""
    print("=== Import 경로 업데이트 중 ===\n")

    # 경로별 변경 매핑 생성 (디렉토리 경로 포함)
    import_map = {}
    for old_path, new_path in renames.items():
        old_name = os.path.splitext(os.path.basename(old_path))[0]
        new_name = os.path.splitext(os.path.basename(new_path))[0]

        # 절대 경로 패턴 (@/로 시작)
        old_import_path = old_path.replace('.tsx', '').replace('.ts', '').replace('/', '/')
        new_import_path = new_path.replace('.tsx', '').replace('.ts', '').replace('/', '/')

        import_map[old_import_path] = new_import_path
        # 파일명만으로도 매칭 (상대 경로용)
        import_map[old_name] = new_name

    # 모든 TypeScript 파일 찾기
    ts_files = []
    for base_dir in ['features', 'shared', 'app']:
        if os.path.exists(base_dir):
            ts_files.extend(Path(base_dir).rglob('*.ts'))
            ts_files.extend(Path(base_dir).rglob('*.tsx'))

    update_count = 0

    for ts_file in ts_files:
        file_path = str(ts_file)
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()

        original_content = content
        changed = False

        # import 구문 찾기 및 업데이트
        for old_import, new_import in import_map.items():
            # import from '@/...' 패턴
            pattern1 = rf"from\s+['\"]@/{re.escape(old_import)}['\"]"
            replacement1 = f"from '@/{new_import}'"
            if re.search(pattern1, content):
                content = re.sub(pattern1, replacement1, content)
                changed = True

            # import from './' 또는 '../' 패턴
            pattern2 = rf"from\s+['\"]\.+/{re.escape(old_import)}['\"]"
            replacement2 = f"from '../{new_import}'"  # 상대 경로는 유지하되 파일명만 변경
            if re.search(pattern2, content):
                # 상대 경로의 depth 유지
                content = re.sub(rf"(from\s+['\"]\.+/)({re.escape(old_import)}['\"])", rf"\1{new_import}'", content)
                changed = True

        if changed:
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(content)
            print(f"Updated: {file_path}")
            update_count += 1

    print(f"\n=== {update_count}개 파일의 import 경로 업데이트 완료 ===\n")

def main():
    if not os.path.exists('scripts/rename-map.txt'):
        print("Error: scripts/rename-map.txt 파일이 없습니다.")
        print("먼저 python3 scripts/rename-files.py를 실행하세요.")
        return

    print("=== 파일명 변경 및 Import 업데이트 시작 ===\n")

    # 매핑 로드
    renames = load_rename_map()
    print(f"총 {len(renames)}개 파일 변경 예정\n")

    # 확인
    response = input("계속 진행하시겠습니까? (yes/no): ")
    if response.lower() not in ['yes', 'y']:
        print("취소되었습니다.")
        return

    # 파일명 변경
    rename_files(renames)

    # Import 경로 업데이트
    update_imports(renames)

    print("=== 모든 작업 완료 ===")
    print("\n다음 단계:")
    print("1. yarn lint 실행하여 에러 확인")
    print("2. yarn build 실행하여 빌드 검증")
    print("3. git status로 변경사항 확인")

if __name__ == '__main__':
    main()
