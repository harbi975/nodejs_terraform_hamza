"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { uploadFile } from "@/lib/api"
import { Upload } from "lucide-react"

interface FileUploaderProps {
  onUploadSuccess: () => void
}

export function FileUploader({ onUploadSuccess }: FileUploaderProps) {
  const [file, setFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const { toast } = useToast()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!file) {
      toast({
        title: "No file selected",
        description: "Please select a file to upload",
        variant: "destructive",
      })
      return
    }

    setIsUploading(true)

    try {
      const formData = new FormData()
      formData.append("file", file)

      await uploadFile(formData)

      toast({
        title: "File uploaded",
        description: "File has been successfully uploaded to S3",
      })

      // Reset form
      setFile(null)

      // Notify parent component to refresh file list
      onUploadSuccess()
    } catch (error) {
      console.error("Error uploading file:", error)
      toast({
        title: "Error",
        description: "Failed to upload file. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="file">Select File</Label>
        <Input id="file" type="file" onChange={handleFileChange} required />
        {file && (
          <p className="text-sm text-gray-500">
            Selected: {file.name} ({(file.size / 1024).toFixed(2)} KB)
          </p>
        )}
      </div>

      <Button type="submit" className="w-full" disabled={isUploading || !file}>
        {isUploading ? (
          <span className="flex items-center">
            <span className="animate-spin mr-2">⟳</span> Uploading...
          </span>
        ) : (
          <span className="flex items-center">
            <Upload className="mr-2 h-4 w-4" /> Upload to S3
          </span>
        )}
      </Button>
    </form>
  )
}
