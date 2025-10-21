"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { SettingsPage } from "@/features/settings/components/settings-page"
import { getCurrentProjectId } from "@/lib/storage"

export default function Settings() {
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

  return (
    <div className="p-6">
      <SettingsPage onBack={handleBack} />
    </div>
  )
}
