import { Suspense } from 'react';
import { InviteAcceptContent } from './InviteAcceptContent';
import { Card, CardHeader, CardTitle, CardDescription } from '@/shared/ui/card';
import { Loader2 } from 'lucide-react';

function InviteAcceptLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
          </div>
          <CardTitle>초대 처리 중...</CardTitle>
          <CardDescription>잠시만 기다려주세요</CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
}

export default function InviteAcceptPage() {
  return (
    <Suspense fallback={<InviteAcceptLoading />}>
      <InviteAcceptContent />
    </Suspense>
  );
}
