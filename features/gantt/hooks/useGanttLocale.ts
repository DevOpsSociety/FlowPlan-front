import { gantt } from 'dhtmlx-gantt';
import { useEffect } from 'react';

/**
 * dhtmlx-gantt 한국어 로케일 설정 훅
 * - 컴포넌트 마운트 시 한 번만 실행
 */
export function useGanttLocale() {
  useEffect(() => {
    gantt.i18n.setLocale({
      date: {
        month_full: [
          '1월',
          '2월',
          '3월',
          '4월',
          '5월',
          '6월',
          '7월',
          '8월',
          '9월',
          '10월',
          '11월',
          '12월',
        ],
        month_short: [
          '1월',
          '2월',
          '3월',
          '4월',
          '5월',
          '6월',
          '7월',
          '8월',
          '9월',
          '10월',
          '11월',
          '12월',
        ],
        day_full: ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'],
        day_short: ['일', '월', '화', '수', '목', '금', '토'],
      },
      labels: {
        new_task: '새 작업',
        icon_save: '저장',
        icon_cancel: '취소',
        icon_details: '상세',
        icon_edit: '편집',
        icon_delete: '삭제',
        confirm_closing: '변경사항이 저장되지 않습니다. 계속하시겠습니까?',
        confirm_deleting: '작업이 영구적으로 삭제됩니다. 계속하시겠습니까?',
        section_description: '설명',
        section_time: '기간',
        section_type: '유형',
        column_wbs: 'WBS',
        column_text: '작업명',
        column_start_date: '시작일',
        column_duration: '기간',
        column_add: '',
        type_task: '작업',
        type_project: '프로젝트',
        type_milestone: '마일스톤',
        minutes: '분',
        hours: '시간',
        days: '일',
        weeks: '주',
        months: '월',
        years: '년',
      },
    });
  }, []);
}
