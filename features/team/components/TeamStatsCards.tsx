'use client';

import type { ProjectMemberDto } from '@/shared/api/memberTypes';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';

interface TeamStatsCardsProps {
  teamMembers: ProjectMemberDto[];
}

/**
 * 팀 통계 카드 컴포넌트
 * - 전체 팀원 수
 * - 관리자 수 (OWNER)
 * - 멤버 수 (MEMBER)
 * - 뷰어 수 (VIEWER)
 */
export function TeamStatsCards({ teamMembers }: TeamStatsCardsProps) {
  const totalCount = teamMembers.length;
  const adminCount = teamMembers.filter((m) => m.role === 'OWNER').length;
  const memberCount = teamMembers.filter((m) => m.role === 'EDITOR').length;
  const viewerCount = teamMembers.filter((m) => m.role === 'VIEWER').length;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">전체 팀원</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalCount}명</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">관리자</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{adminCount}명</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">멤버</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{memberCount}명</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">뷰어</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{viewerCount}명</div>
        </CardContent>
      </Card>
    </div>
  );
}
