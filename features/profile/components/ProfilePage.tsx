'use client';

import { useState, useEffect } from 'react';
import { User, Mail, Phone, MapPin, Calendar, Edit, Save, X } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/ui/avatar';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { Textarea } from '@/shared/ui/textarea';
import { Badge } from '@/shared/ui/badge';
import { ProfileSkeleton } from '@/features/profile/skeletons/ProfileSkeleton';

interface ProfilePageProps {
  onBack: () => void;
}

interface UserProfile {
  id: number;
  name: string;
  email: string;
  isNewUser: boolean;
}

export function ProfilePage({ onBack }: ProfilePageProps) {
  const defaultProfileData = {
    name: '김철수',
    email: 'kim.chulsoo@company.com',
    phone: '010-1234-5678',
    location: '서울, 대한민국',
    joinDate: '2023년 3월',
    bio: '프로젝트 관리 전문가로 5년 이상의 경험을 보유하고 있습니다. 효율적인 팀 협업과 일정 관리를 통해 성공적인 프로젝트 완수를 목표로 합니다.',
    department: '개발팀',
    position: '시니어 프로젝트 매니저',
    skills: ['프로젝트 관리', '팀 리더십', '일정 관리', '리스크 관리', 'Agile/Scrum'],
  };

  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState(defaultProfileData);
  const [editData, setEditData] = useState(defaultProfileData);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');

    if (storedUser) {
      try {
        const loggedInUser: UserProfile = JSON.parse(storedUser);

        const mergedProfileData = {
          ...defaultProfileData,
          name: loggedInUser.name,
          email: loggedInUser.email,
        };

        setProfileData(mergedProfileData);
        setEditData(mergedProfileData);
      } catch (error) {
        console.error('localStorage user 파싱 오류:', error);
      }
    }

    setIsLoading(false);
  }, []);

  const handleEdit = () => {
    setIsEditing(true);
    setEditData(profileData);
  };

  const handleSave = () => {
    setProfileData(editData);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditData(profileData);
    setIsEditing(false);
  };

  const handleInputChange = (field: string, value: string) => {
    setEditData((prev) => ({ ...prev, [field]: value }));
  };

  if (isLoading) {
    return <ProfileSkeleton />;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* 헤더 */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b">
        <div className="flex items-center justify-between p-6">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold">프로필</h1>
          </div>
          <div className="flex items-center space-x-2">
            {isEditing ? (
              <>
                <Button variant="outline" size="sm" onClick={handleCancel}>
                  <X className="h-4 w-4 mr-2" />
                  취소
                </Button>
                <Button size="sm" onClick={handleSave}>
                  <Save className="h-4 w-4 mr-2" />
                  저장
                </Button>
              </>
            ) : (
              <Button size="sm" onClick={handleEdit}>
                <Edit className="h-4 w-4 mr-2" />
                편집
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-6 space-y-6">
        {/* 기본 정보 카드 */}
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-6">
              <Avatar className="h-24 w-24">
                <AvatarImage src="/placeholder.svg?height=96&width=96" alt="프로필 사진" />
                <AvatarFallback className="text-2xl">
                  <User className="h-12 w-12" />
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                {isEditing ? (
                  <div className="space-y-3">
                    <div>
                      <Label htmlFor="name">이름</Label>
                      <Input
                        id="name"
                        value={editData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="position">직책</Label>
                      <Input
                        id="position"
                        value={editData.position}
                        onChange={(e) => handleInputChange('position', e.target.value)}
                        className="mt-1"
                      />
                    </div>
                  </div>
                ) : (
                  <>
                    <CardTitle className="text-3xl">{profileData.name}</CardTitle>
                    <CardDescription className="text-lg">{profileData.position}</CardDescription>
                    <div className="flex items-center space-x-4 mt-2 text-sm text-muted-foreground">
                      <div className="flex items-center space-x-1">
                        <MapPin className="h-4 w-4" />
                        <span>{profileData.location}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-4 w-4" />
                        <span>{profileData.joinDate} 입사</span>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* 연락처 정보 */}
        <Card>
          <CardHeader>
            <CardTitle>연락처 정보</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center space-x-2">
                  <Mail className="h-4 w-4" />
                  <span>이메일</span>
                </Label>
                {isEditing ? (
                  <Input
                    id="email"
                    type="email"
                    value={editData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                  />
                ) : (
                  <p className="text-sm text-muted-foreground">{profileData.email}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone" className="flex items-center space-x-2">
                  <Phone className="h-4 w-4" />
                  <span>전화번호</span>
                </Label>
                {isEditing ? (
                  <Input
                    id="phone"
                    value={editData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                  />
                ) : (
                  <p className="text-sm text-muted-foreground">{profileData.phone}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="department">부서</Label>
                {isEditing ? (
                  <Input
                    id="department"
                    value={editData.department}
                    onChange={(e) => handleInputChange('department', e.target.value)}
                  />
                ) : (
                  <p className="text-sm text-muted-foreground">{profileData.department}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="location" className="flex items-center space-x-2">
                  <MapPin className="h-4 w-4" />
                  <span>위치</span>
                </Label>
                {isEditing ? (
                  <Input
                    id="location"
                    value={editData.location}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                  />
                ) : (
                  <p className="text-sm text-muted-foreground">{profileData.location}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 소개 */}
        <Card>
          <CardHeader>
            <CardTitle>소개</CardTitle>
          </CardHeader>
          <CardContent>
            {isEditing ? (
              <Textarea
                value={editData.bio}
                onChange={(e) => handleInputChange('bio', e.target.value)}
                rows={4}
                placeholder="자기소개를 입력하세요..."
              />
            ) : (
              <p className="text-sm text-muted-foreground leading-relaxed">{profileData.bio}</p>
            )}
          </CardContent>
        </Card>

        {/* 스킬 */}
        <Card>
          <CardHeader>
            <CardTitle>보유 스킬</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {profileData.skills.map((skill, index) => (
                <Badge key={index} variant="secondary">
                  {skill}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* 프로젝트 통계 */}
        <Card>
          <CardHeader>
            <CardTitle>프로젝트 통계</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">12</div>
                <div className="text-sm text-muted-foreground">완료된 프로젝트</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">3</div>
                <div className="text-sm text-muted-foreground">진행 중인 프로젝트</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">95%</div>
                <div className="text-sm text-muted-foreground">성공률</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">2.5년</div>
                <div className="text-sm text-muted-foreground">평균 프로젝트 기간</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
