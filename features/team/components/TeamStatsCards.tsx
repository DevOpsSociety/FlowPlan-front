'use client';

import type { TeamMember } from '@/shared/lib/apiTypes';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';

interface TeamStatsCardsProps {
  teamMembers: TeamMember[];
}

/**
 * 팀 통계 카드 컴포넌트
 * - 전체 팀원 수
 * - 관리자 수 (admin, owner)
 * - 멤버 수 (member)
 */
export function TeamStatsCards({ teamMembers }: TeamStatsCardsProps) {
  const totalCount = teamMembers.length;
  const adminCount = teamMembers.filter((m) => m.role === 'admin' || m.role === 'owner').length;
  const memberCount = teamMembers.filter((m) => m.role === 'member').length;

  return (
    <div className="grid gap-4 md:grid-cols-3">
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
    </div>
  );
}
