'use client';

import { acceptInvitation } from '@/shared/api/invitationApi';
import { Button } from '@/shared/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card';
import { CheckCircle2, Loader2, XCircle } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

export function InviteAcceptContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState('');
  const [countdown, setCountdown] = useState(3);
  const dataFetchedRef = useRef(false);

  useEffect(() => {
    // 이미 처리되었으면 중단
    if (dataFetchedRef.current) return;
    dataFetchedRef.current = true;

    const handleAccept = async () => {
      // 토큰 없음
      if (!token) {
        setStatus('error');
        setErrorMessage('잘못된 초대 링크입니다');
        toast.error('잘못된 초대 링크입니다');
        setTimeout(() => router.push('/projects'), 2000);
        return;
      }

      // 로그인 체크
      const authToken = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
      if (!authToken) {
        toast.error('초대를 수락하려면 먼저 로그인해주세요');
        router.push('/projects');
        return;
      }

      // 초대 수락 처리
      try {
        await acceptInvitation(token);
        setStatus('success');
        toast.success('프로젝트 초대를 수락했습니다');

        // 3초 카운트다운 후 리디렉션
        let count = 3;
        const interval = setInterval(() => {
          count--;
          setCountdown(count);
          if (count <= 0) {
            clearInterval(interval);
            router.push('/projects');
          }
        }, 1000);
      } catch (error) {
        console.error('Failed to accept invitation:', error);
        setStatus('error');

        // 에러 메시지 파싱
        let message = '초대 수락에 실패했습니다';
        if (error instanceof Error) {
          if (error.message.includes('400')) {
            message = '이미 수락된 초대이거나 잘못된 링크입니다';
          } else if (error.message.includes('404')) {
            message = '만료된 초대 링크입니다';
          } else if (error.message.includes('403')) {
            message = '이 초대에 접근할 수 없습니다';
          }
        }

        setErrorMessage(message);
        toast.error(message);
      }
    };

    handleAccept();
  }, [token, router]);

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            {status === 'loading' && <Loader2 className="h-12 w-12 animate-spin text-primary" />}
            {status === 'success' && <CheckCircle2 className="h-12 w-12 text-green-500" />}
            {status === 'error' && <XCircle className="h-12 w-12 text-destructive" />}
          </div>
          <CardTitle>
            {status === 'loading' && '초대 처리 중...'}
            {status === 'success' && '초대 수락 완료'}
            {status === 'error' && '초대 수락 실패'}
          </CardTitle>
          <CardDescription>
            {status === 'loading' && '잠시만 기다려주세요'}
            {status === 'success' && `${countdown}초 후 프로젝트 목록으로 이동합니다`}
            {status === 'error' && errorMessage}
          </CardDescription>
        </CardHeader>
        {status === 'error' && (
          <CardContent className="flex justify-center">
            <Button onClick={() => router.push('/projects')}>프로젝트 목록으로 가기</Button>
          </CardContent>
        )}
      </Card>
    </div>
  );
}
