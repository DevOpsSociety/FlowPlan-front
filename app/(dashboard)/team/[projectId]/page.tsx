"use client"

import { useParams, useRouter } from "next/navigation"
import { TeamManagementPage } from "@/components/pages/team-management-page"

export default function TeamManagement() {
  const params = useParams()
  const router = useRouter()
  const projectId = params.projectId as string

  const handleBack = () => {
    router.push(`/project/${projectId}`)
  }

  return (
    <div className="p-6">
      <TeamManagementPage projectId={projectId} onBack={handleBack} />
    </div>
  )
}
