"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FileUploader } from "@/components/file-uploader"
import { FileList } from "@/components/file-list"

export default function FilesPage() {
  const [isUploading, setIsUploading] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)
  const router = useRouter()

  const handleUploadSuccess = () => {
    setRefreshKey((prev) => prev + 1)
  }

  return (
    <main className="container mx-auto py-10 px-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">File Management</h1>
        <Button variant="outline" onClick={() => router.push("/")}>
          Back to Home
        </Button>
      </div>

      <div className="grid md:grid-cols-1 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Upload Files</CardTitle>
            <CardDescription>Upload documents (PDF, DOCX, etc.) to S3</CardDescription>
          </CardHeader>
          <CardContent>
            <FileUploader onUploadSuccess={handleUploadSuccess} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>File List</CardTitle>
            <CardDescription>View, download, and delete files from S3</CardDescription>
          </CardHeader>
          <CardContent>
            <FileList refreshKey={refreshKey} />
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
