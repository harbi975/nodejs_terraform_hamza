import express from "express"
import cors from "cors"
import multer from "multer"
import { PrismaClient } from "@prisma/client"
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  ListObjectsV2Command,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"
import dotenv from "dotenv"

// Initialize environment variables
dotenv.config()

// Initialize Express app
const app = express()
const PORT = process.env.PORT || 3001

// Middleware
app.use(cors())
app.use(express.json())

// Initialize Prisma client
const prisma = new PrismaClient()

// Initialize S3 client
const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
})

// Configure multer for file uploads
const storage = multer.memoryStorage()
const upload = multer({ storage })

// API Routes

// User routes
app.post("/api/users", upload.single("profilePicture"), async (req, res) => {
  try {
    const { name, email } = req.body
    const file = req.file

    if (!name || !email || !file) {
      return res.status(400).json({ message: "Missing required fields" })
    }

    // Upload profile picture to S3
    const fileKey = `profile-pictures/${Date.now()}-${file.originalname}`

    const uploadParams = {
      Bucket: process.env.S3_BUCKET_NAME,
      Key: fileKey,
      Body: file.buffer,
      ContentType: file.mimetype,
    }

    await s3Client.send(new PutObjectCommand(uploadParams))

    // Generate S3 URL for the uploaded image
    const profilePictureUrl = `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileKey}`

    // Create user in database
    const user = await prisma.user.create({
      data: {
        name,
        email,
        profilePictureUrl,
      },
    })

    res.status(201).json(user)
  } catch (error) {
    console.error("Error creating user:", error)
    res.status(500).json({ message: "Failed to create user", error: error.message })
  }
})

app.get("/api/users", async (req, res) => {
  try {
    const users = await prisma.user.findMany()
    res.json(users)
  } catch (error) {
    console.error("Error fetching users:", error)
    res.status(500).json({ message: "Failed to fetch users", error: error.message })
  }
})

app.delete("/api/users/:id", async (req, res) => {
  try {
    const { id } = req.params

    // Get user to find profile picture URL
    const user = await prisma.user.findUnique({
      where: { id: Number.parseInt(id) },
    })

    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }

    // Delete user from database
    await prisma.user.delete({
      where: { id: Number.parseInt(id) },
    })

    // Extract key from profile picture URL
    const profilePictureKey = user.profilePictureUrl.split(".com/")[1]

    // Delete profile picture from S3
    if (profilePictureKey) {
      await s3Client.send(
        new DeleteObjectCommand({
          Bucket: process.env.S3_BUCKET_NAME,
          Key: profilePictureKey,
        }),
      )
    }

    res.json({ message: "User deleted successfully" })
  } catch (error) {
    console.error("Error deleting user:", error)
    res.status(500).json({ message: "Failed to delete user", error: error.message })
  }
})

// File routes
app.post("/api/files", upload.single("file"), async (req, res) => {
  try {
    const file = req.file

    if (!file) {
      return res.status(400).json({ message: "No file uploaded" })
    }

    // Upload file to S3
    const fileKey = `files/${Date.now()}-${file.originalname}`

    const uploadParams = {
      Bucket: process.env.S3_BUCKET_NAME,
      Key: fileKey,
      Body: file.buffer,
      ContentType: file.mimetype,
    }

    await s3Client.send(new PutObjectCommand(uploadParams))

    res.status(201).json({
      message: "File uploaded successfully",
      key: fileKey,
      name: file.originalname,
      size: file.size,
      type: file.mimetype,
    })
  } catch (error) {
    console.error("Error uploading file:", error)
    res.status(500).json({ message: "Failed to upload file", error: error.message })
  }
})

app.get("/api/files", async (req, res) => {
  try {
    const listParams = {
      Bucket: process.env.S3_BUCKET_NAME,
      Prefix: "files/",
    }

    const data = await s3Client.send(new ListObjectsV2Command(listParams))

    if (!data.Contents) {
      return res.json([])
    }

    // Map S3 objects to a more user-friendly format
    const files = await Promise.all(
      data.Contents.map(async (object) => {
        // Generate a pre-signed URL for each file (valid for 1 hour)
        const command = new GetObjectCommand({
          Bucket: process.env.S3_BUCKET_NAME,
          Key: object.Key,
        })

        const url = await getSignedUrl(s3Client, command, { expiresIn: 3600 })

        return {
          key: object.Key,
          size: object.Size,
          lastModified: object.LastModified,
          url,
        }
      }),
    )

    res.json(files)
  } catch (error) {
    console.error("Error listing files:", error)
    res.status(500).json({ message: "Failed to list files", error: error.message })
  }
})

app.delete("/api/files", async (req, res) => {
  try {
    const { key } = req.body

    if (!key) {
      return res.status(400).json({ message: "File key is required" })
    }

    await s3Client.send(
      new DeleteObjectCommand({
        Bucket: process.env.S3_BUCKET_NAME,
        Key: key,
      }),
    )

    res.json({ message: "File deleted successfully" })
  } catch (error) {
    console.error("Error deleting file:", error)
    res.status(500).json({ message: "Failed to delete file", error: error.message })
  }
})

app.post("/api/files/download", async (req, res) => {
  try {
    const { key } = req.body

    if (!key) {
      return res.status(400).json({ message: "File key is required" })
    }

    // Generate a pre-signed URL for downloading the file (valid for 1 hour)
    const command = new GetObjectCommand({
      Bucket: process.env.S3_BUCKET_NAME,
      Key: key,
    })

    const url = await getSignedUrl(s3Client, command, { expiresIn: 3600 })

    res.json({ url })
  } catch (error) {
    console.error("Error generating download URL:", error)
    res.status(500).json({ message: "Failed to generate download URL", error: error.message })
  }
})

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
