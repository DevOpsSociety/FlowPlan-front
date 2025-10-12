"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Bell, Download, Palette, Save, Shield, Trash2, User } from "lucide-react";
import { useTheme } from "next-themes";
import { useState, useEffect } from "react";
import { SettingsSkeleton } from "@/components/skeletons/settings-skeleton";

interface SettingsPageProps {
  onBack: () => void;
}

export function SettingsPage({ onBack }: SettingsPageProps) {
  const { theme, setTheme } = useTheme();
  const [isLoading, setIsLoading] = useState(true);

  const [settings, setSettings] = useState({
    // 계정 설정
    name: "김철수",
    email: "kimcs@example.com",
    company: "테크 컴퍼니",
    position: "프로젝트 매니저",

    // 알림 설정
    emailNotifications: true,
    pushNotifications: true,
    projectUpdates: true,
    deadlineReminders: true,
    weeklyReports: false,

    // 개인화 설정
    language: "ko",
    timezone: "Asia/Seoul",
    dateFormat: "YYYY-MM-DD",

    // 보안 설정
    twoFactorAuth: false,
    sessionTimeout: "30",
  });

  useEffect(() => {
    // Simulate loading settings
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 500)

    return () => clearTimeout(timer)
  }, [])

  const handleSettingChange = (key: string, value: any) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const handleThemeChange = (newTheme: string) => {
    setTheme(newTheme);
  };

  const handleSave = () => {
    // 설정 저장 로직
    console.log("Settings saved:", settings);
  };

  if (isLoading) {
    return <SettingsSkeleton />
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border bg-card">
        <div className="flex items-center gap-4 p-6">
          <div>
            <h1 className="text-2xl font-bold">설정</h1>
            <p className="text-muted-foreground">계정 및 애플리케이션 설정을 관리하세요</p>
          </div>
        </div>
      </div>

      <div className="p-6">
        <Tabs defaultValue="account" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="account">계정</TabsTrigger>
            <TabsTrigger value="notifications">알림</TabsTrigger>
            <TabsTrigger value="appearance">외관</TabsTrigger>
            <TabsTrigger value="security">보안</TabsTrigger>
          </TabsList>

          {/* 계정 설정 */}
          <TabsContent value="account" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  프로필 정보
                </CardTitle>
                <CardDescription>기본 프로필 정보를 관리하세요</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center gap-6">
                  <Avatar className="h-20 w-20">
                    <AvatarImage src="/placeholder.svg?height=80&width=80" />
                    <AvatarFallback>김철</AvatarFallback>
                  </Avatar>
                  <div className="space-y-2">
                    <Button variant="outline">프로필 사진 변경</Button>
                    <p className="text-sm text-muted-foreground">JPG, PNG 파일만 업로드 가능합니다 (최대 5MB)</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">이름</Label>
                    <Input
                      id="name"
                      value={settings.name}
                      onChange={(e) => handleSettingChange("name", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">이메일</Label>
                    <Input
                      id="email"
                      type="email"
                      value={settings.email}
                      onChange={(e) => handleSettingChange("email", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="company">회사</Label>
                    <Input
                      id="company"
                      value={settings.company}
                      onChange={(e) => handleSettingChange("company", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="position">직책</Label>
                    <Input
                      id="position"
                      value={settings.position}
                      onChange={(e) => handleSettingChange("position", e.target.value)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 알림 설정 */}
          <TabsContent value="notifications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  알림 설정
                </CardTitle>
                <CardDescription>받고 싶은 알림을 선택하세요</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>이메일 알림</Label>
                      <p className="text-sm text-muted-foreground">중요한 업데이트를 이메일로 받습니다</p>
                    </div>
                    <Switch
                      checked={settings.emailNotifications}
                      onCheckedChange={(checked) => handleSettingChange("emailNotifications", checked)}
                    />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>푸시 알림</Label>
                      <p className="text-sm text-muted-foreground">브라우저 푸시 알림을 받습니다</p>
                    </div>
                    <Switch
                      checked={settings.pushNotifications}
                      onCheckedChange={(checked) => handleSettingChange("pushNotifications", checked)}
                    />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>프로젝트 업데이트</Label>
                      <p className="text-sm text-muted-foreground">프로젝트 진행 상황 알림</p>
                    </div>
                    <Switch
                      checked={settings.projectUpdates}
                      onCheckedChange={(checked) => handleSettingChange("projectUpdates", checked)}
                    />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>마감일 알림</Label>
                      <p className="text-sm text-muted-foreground">마감일 임박 시 알림</p>
                    </div>
                    <Switch
                      checked={settings.deadlineReminders}
                      onCheckedChange={(checked) => handleSettingChange("deadlineReminders", checked)}
                    />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>주간 리포트</Label>
                      <p className="text-sm text-muted-foreground">매주 프로젝트 요약 리포트</p>
                    </div>
                    <Switch
                      checked={settings.weeklyReports}
                      onCheckedChange={(checked) => handleSettingChange("weeklyReports", checked)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 외관 설정 */}
          <TabsContent value="appearance" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="h-5 w-5" />
                  외관 설정
                </CardTitle>
                <CardDescription>애플리케이션의 외관을 사용자 정의하세요</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>테마</Label>
                    <Select value={theme} onValueChange={handleThemeChange}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="light">라이트</SelectItem>
                        <SelectItem value="dark">다크</SelectItem>
                        <SelectItem value="system">시스템 설정</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>언어</Label>
                    <Select value={settings.language} onValueChange={(value) => handleSettingChange("language", value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ko">한국어</SelectItem>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="ja">日本語</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>시간대</Label>
                    <Select value={settings.timezone} onValueChange={(value) => handleSettingChange("timezone", value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Asia/Seoul">서울 (UTC+9)</SelectItem>
                        <SelectItem value="UTC">UTC (UTC+0)</SelectItem>
                        <SelectItem value="America/New_York">뉴욕 (UTC-5)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>날짜 형식</Label>
                    <Select
                      value={settings.dateFormat}
                      onValueChange={(value) => handleSettingChange("dateFormat", value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="YYYY-MM-DD">2024-01-15</SelectItem>
                        <SelectItem value="MM/DD/YYYY">01/15/2024</SelectItem>
                        <SelectItem value="DD/MM/YYYY">15/01/2024</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 보안 설정 */}
          <TabsContent value="security" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  보안 설정
                </CardTitle>
                <CardDescription>계정 보안을 강화하세요</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>2단계 인증</Label>
                      <p className="text-sm text-muted-foreground">추가 보안을 위한 2단계 인증 활성화</p>
                    </div>
                    <Switch
                      checked={settings.twoFactorAuth}
                      onCheckedChange={(checked) => handleSettingChange("twoFactorAuth", checked)}
                    />
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <Label>세션 타임아웃</Label>
                    <Select
                      value={settings.sessionTimeout}
                      onValueChange={(value) => handleSettingChange("sessionTimeout", value)}
                    >
                      <SelectTrigger className="w-48">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="15">15분</SelectItem>
                        <SelectItem value="30">30분</SelectItem>
                        <SelectItem value="60">1시간</SelectItem>
                        <SelectItem value="240">4시간</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-sm text-muted-foreground">비활성 상태에서 자동 로그아웃되는 시간</p>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <Label>비밀번호 변경</Label>
                    <Button variant="outline">비밀번호 변경</Button>
                    <p className="text-sm text-muted-foreground">정기적인 비밀번호 변경을 권장합니다</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-red-600">위험 구역</CardTitle>
                <CardDescription>신중하게 사용하세요. 이 작업들은 되돌릴 수 없습니다.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 border border-red-200 rounded-lg">
                  <div>
                    <Label className="text-red-600">데이터 내보내기</Label>
                    <p className="text-sm text-muted-foreground">모든 프로젝트 데이터를 내보냅니다</p>
                  </div>
                  <Button variant="outline" className="text-red-600 border-red-200 bg-transparent">
                    <Download className="h-4 w-4 mr-2" />
                    내보내기
                  </Button>
                </div>

                <div className="flex items-center justify-between p-4 border border-red-200 rounded-lg">
                  <div>
                    <Label className="text-red-600">계정 삭제</Label>
                    <p className="text-sm text-muted-foreground">계정과 모든 데이터를 영구적으로 삭제합니다</p>
                  </div>
                  <Button variant="destructive">
                    <Trash2 className="h-4 w-4 mr-2" />
                    계정 삭제
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* 저장 버튼 */}
        <div className="flex justify-end pt-6">
          <Button onClick={handleSave} className="flex items-center gap-2">
            <Save className="h-4 w-4" />
            설정 저장
          </Button>
        </div>
      </div>
    </div>
  );
}
