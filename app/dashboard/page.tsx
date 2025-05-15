import { redirect } from "next/navigation"
import { auth } from "@/auth"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Manage your career insights dashboard",
}

export default async function Page() {
  const session = await auth()
  if (!session) {
    redirect("/")
  }
  redirect("/dashboard/career-compass")
}
