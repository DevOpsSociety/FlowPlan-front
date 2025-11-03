import { redirect } from 'next/navigation';

/**
 * 프로젝트 상세 페이지 리다이렉션
 *
 * /project/[id] 접근 시 기본 뷰인 WBS Table로 리다이렉션합니다.
 * 실제 컨텐츠는 layout.tsx와 각 뷰별 page.tsx에서 렌더링됩니다.
 */
export default function ProjectPage({ params }: { params: { id: string } }) {
  redirect(`/project/${params.id}/wbs-table`);
}
