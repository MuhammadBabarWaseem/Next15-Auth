import { getServerSession } from "next-auth/next"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"

export default async function Dashboard() {
  const session = await getServerSession()

  if (!session) {
    redirect("/login")
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-4xl font-bold mb-8">Welcome to your Dashboard</h1>
      <p className="mb-4">You're logged in as {session.user?.email}</p>
      <form action="/api/auth/signout" method="POST">
        <Button type="submit">Sign out</Button>
      </form>
    </div>
  )
}

