'use client';

import { useState } from 'react';
import { cn } from '@/shared/lib/utils';
import { GoogleLogin, CredentialResponse } from '@react-oauth/google';
import { Loader2 } from 'lucide-react'; // 로딩 표시용

export interface UserProfile {
  name: string;
  email: string;
}

interface GoogleLoginButtonProps {
  collapsed: boolean;
  onLoginSuccess: (user: UserProfile, token: string) => void;
  onLoginError: () => void;
}

export function GoogleLoginButton({
  collapsed,
  onLoginSuccess,
  onLoginError,
}: GoogleLoginButtonProps) {
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const handleSuccess = async (credentialResponse: CredentialResponse) => {
    setIsLoggingIn(true);
    const idToken = credentialResponse.credential;

    if (!idToken) {
      console.error('id_token을 받지 못했습니다.');
      setIsLoggingIn(false);
      onLoginError();
      return;
    }

    try {
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL;
      const response = await fetch(`${apiBaseUrl}/api/auth/google/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken }),
      });

      if (!response.ok) {
        throw new Error(`API 서버 오류: ${response.status}`);
      }

      const authorizationHeader = response.headers.get('authorization');
      let token = null;

      if (authorizationHeader && authorizationHeader.startsWith('Bearer ')) {
        // 'Bearer ' 라는 접두사를 제거한 순수 토큰 값만 저장합니다.
        token = authorizationHeader.split(' ')[1];
      }

      const refreshToken = response.headers.get('refresh-token');
      if (refreshToken) {
        localStorage.setItem('refreshToken', refreshToken); // <b><-- 중요!</b>
      }

      const user = await response.json();

      if (user && token) {
        onLoginSuccess(user, token); // 성공!
        console.log('Google 로그인 성공:', user);
      } else {
        // 둘 중 하나라도 없으면 에러 처리
        throw new Error('서버 응답에서 user(body) 또는 token(header)을 받지 못했습니다.');
      }
    } catch (error) {
      console.error('로그인 API 연동 실패:', error);
      onLoginError();
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleError = () => {
    console.error('Google 로그인 실패');
    setIsLoggingIn(false);
    onLoginError();
  };

  // 로딩 중일 때 로더만 표시
  if (isLoggingIn) {
    return (
      <div
        className={cn(
          'flex h-10 w-full items-center justify-center rounded-md bg-gray-100',
          collapsed ? 'w-10' : 'w-full'
        )}
      >
        <Loader2 className="h-4 w-4 animate-spin" />
      </div>
    );
  }

  // `collapsed` 여부로 props 분기
  if (collapsed) {
    // ------------------ 축소 상태 (아이콘 버튼) ------------------
    return (
      <GoogleLogin
        onSuccess={handleSuccess}
        onError={handleError}
        type="icon"
        theme="outline"
        shape="rectangular"
      />
    );
  }

  // ------------------ 확장 상태 (텍스트 버튼) ------------------
  return (
    <GoogleLogin
      onSuccess={handleSuccess}
      onError={handleError}
      type="standard"
      theme="outline"
      text="continue_with"
      shape="rectangular"
      width="100%"
    />
  );
}
