import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function Home() {
  return (
    <main className="container mx-auto py-10 px-4">
      <h1 className="text-4xl font-bold mb-8 text-center">AWS Next.js Application</h1>

      <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>User Management</CardTitle>
            <CardDescription>Add and manage users with profile pictures stored in S3</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/users">
              <Button className="w-full">Go to User Management</Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>File Management</CardTitle>
            <CardDescription>Upload, list, download, and delete files from S3</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/files">
              <Button className="w-full">Go to File Management</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
