/**
 * 태스크 상태 관련 공통 유틸리티 함수
 */

/**
 * progress 값에 따른 status 결정
 * - 0: TODO
 * - 1~99: IN_PROGRESS
 * - 100: DONE
 *
 * @param progress - 진행률 (0-100)
 * @returns 진행률에 따른 상태
 */
export const getStatusFromProgress = (progress: number): 'TODO' | 'IN_PROGRESS' | 'DONE' => {
  if (progress === 0) return 'TODO';
  if (progress === 100) return 'DONE';
  return 'IN_PROGRESS';
};
