import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent } from "@/components/ui/card"

export function NewProjectSkeleton() {
  return (
    <div className="min-h-full bg-background">
      {/* Header Skeleton */}
      <div className="border-b border-border bg-card sticky top-0 z-10">
        <div className="flex items-center gap-4 p-6">
          <div className="space-y-2">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-96" />
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Title Skeleton */}
          <div className="text-center space-y-2">
            <Skeleton className="h-8 w-64 mx-auto" />
            <Skeleton className="h-4 w-96 mx-auto" />
          </div>

          {/* Form Card Skeleton */}
          <Card>
            <CardContent className="pt-6 space-y-6">
              {/* Project Title Field */}
              <div className="space-y-2">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-10 w-full" />
              </div>

              {/* Project Description Field */}
              <div className="space-y-2">
                <Skeleton className="h-5 w-40" />
                <Skeleton className="h-24 w-full" />
              </div>

              {/* Grid Fields */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Skeleton className="h-5 w-24" />
                  <Skeleton className="h-10 w-full" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-5 w-28" />
                  <Skeleton className="h-10 w-full" />
                </div>
              </div>

              {/* Additional Fields */}
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-5 w-36" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ))}

              {/* Submit Button */}
              <div className="flex justify-end gap-2">
                <Skeleton className="h-10 w-24" />
                <Skeleton className="h-10 w-32" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
