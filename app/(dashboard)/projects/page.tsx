"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ProjectListPage } from "@/components/pages/project-list-page"
import { getCurrentProjectId } from "@/lib/storage"

export default function Projects() {
  const router = useRouter()
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(null)

  useEffect(() => {
    const projectId = getCurrentProjectId()
    setCurrentProjectId(projectId)
  }, [router])

  const handleBack = () => {
    if (currentProjectId) {
      router.push(`/project/${currentProjectId}`)
    } else {
      router.push("/")
    }
  }

  const handleSelectProject = (project: any) => {
    router.push(`/project/${project.id}`)
  }

  return (
    <div className="p-6">
      <ProjectListPage onBack={handleBack} onSelectProject={handleSelectProject} />
    </div>
  )
}
