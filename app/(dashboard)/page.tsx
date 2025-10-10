"use client";


export default function HomePage() {
  // const router = useRouter()

  // useEffect(() => {
  //   const checkAuth = () => {
  //     const token = localStorage.getItem("authToken")
  //     if (!token) {
  //       router.push("/login")
  //       return
  //     }

  //     const currentProjectId = getCurrentProjectId()
  //     if (currentProjectId) {
  //       router.push(`/project/${currentProjectId}`)
  //     } else if (mockProjects.length > 0) {
  //       router.push(`/project/${mockProjects[0].id}`)
  //     } else {
  //       // No projects available, stay on home page to create one
  //       router.push("/new-project")
  //     }
  //   }

  //   checkAuth()
  // }, [router])

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">로딩 중...</p>
      </div>
    </div>
  );
}
