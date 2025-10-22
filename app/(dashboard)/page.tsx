import { redirect } from 'next/navigation';

export default function HomePage() {
  // MVP: 항상 프로젝트 목록으로 리다이렉트
  redirect('/projects');
}
