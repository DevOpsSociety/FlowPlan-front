import Link from "next/link"

export function HeaderLogo() {
  return (
    <Link href="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
        <span className="text-lg font-bold text-primary-foreground">F</span>
      </div>
      <h1 className="text-xl font-bold">FlowPlan</h1>
    </Link>
  )
}
