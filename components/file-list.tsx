"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { fetchFiles, deleteFile, getFileDownloadUrl } from "@/lib/api"
import { Download, Trash2, File } from "lucide-react"

interface S3File {
  key: string
  size: number
  lastModified: string
  url: string
}

interface FileListProps {
  refreshKey: number
}

export function FileList({ refreshKey }: FileListProps) {
  const [files, setFiles] = useState<S3File[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  const loadFiles = async () => {
    setIsLoading(true)
    try {
      const data = await fetchFiles()
      setFiles(data)
    } catch (error) {
      console.error("Error fetching files:", error)
      toast({
        title: "Error",
        description: "Failed to load files from S3",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadFiles()
  }, [refreshKey])

  const handleDelete = async (key: string) => {
    try {
      await deleteFile(key)
      setFiles(files.filter((file) => file.key !== key))
      toast({
        title: "File deleted",
        description: "File has been successfully deleted from S3",
      })
    } catch (error) {
      console.error("Error deleting file:", error)
      toast({
        title: "Error",
        description: "Failed to delete file",
        variant: "destructive",
      })
    }
  }

  const handleDownload = async (key: string) => {
    try {
      const url = await getFileDownloadUrl(key)

      // Create a temporary link and trigger download
      const link = document.createElement("a")
      link.href = url
      link.setAttribute("download", key.split("/").pop() || "download")
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch (error) {
      console.error("Error downloading file:", error)
      toast({
        title: "Error",
        description: "Failed to download file",
        variant: "destructive",
      })
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B"
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + " KB"
    return (bytes / (1024 * 1024)).toFixed(2) + " MB"
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString()
  }

  const getFileName = (key: string) => {
    return key.split("/").pop() || key
  }

  if (isLoading) {
    return <div className="text-center py-4">Loading files...</div>
  }

  if (files.length === 0) {
    return <div className="text-center py-4">No files found. Upload a file to get started.</div>
  }

  return (
    <div className="space-y-4">
      {files.map((file) => (
        <Card key={file.key} className="p-4">
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-3">
              <File className="h-6 w-6 text-blue-500 mt-1" />
              <div>
                <h3 className="font-medium truncate max-w-[200px]" title={getFileName(file.key)}>
                  {getFileName(file.key)}
                </h3>
                <p className="text-sm text-gray-500">{formatFileSize(file.size)}</p>
                <p className="text-xs text-gray-400">{formatDate(file.lastModified)}</p>
              </div>
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" size="icon" onClick={() => handleDownload(file.key)} title="Download">
                <Download className="h-4 w-4" />
              </Button>
              <Button variant="destructive" size="icon" onClick={() => handleDelete(file.key)} title="Delete">
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
}
