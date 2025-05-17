// API functions for interacting with the backend

// Base URL for API requests
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api"

// User API functions
export async function createUser(formData: FormData) {
  const response = await fetch(`${API_BASE_URL}/users`, {
    method: "POST",
    body: formData,
    // Don't set Content-Type header when using FormData
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || "Failed to create user")
  }

  return response.json()
}

export async function fetchUsers() {
  const response = await fetch(`${API_BASE_URL}/users`)

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || "Failed to fetch users")
  }

  return response.json()
}

export async function deleteUser(id: number) {
  const response = await fetch(`${API_BASE_URL}/users/${id}`, {
    method: "DELETE",
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || "Failed to delete user")
  }

  return response.json()
}

// File API functions
export async function uploadFile(formData: FormData) {
  const response = await fetch(`${API_BASE_URL}/files`, {
    method: "POST",
    body: formData,
    // Don't set Content-Type header when using FormData
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || "Failed to upload file")
  }

  return response.json()
}

export async function fetchFiles() {
  const response = await fetch(`${API_BASE_URL}/files`)

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || "Failed to fetch files")
  }

  return response.json()
}

export async function deleteFile(key: string) {
  const response = await fetch(`${API_BASE_URL}/files`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ key }),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || "Failed to delete file")
  }

  return response.json()
}

export async function getFileDownloadUrl(key: string) {
  const response = await fetch(`${API_BASE_URL}/files/download`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ key }),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || "Failed to get download URL")
  }

  const data = await response.json()
  return data.url
}
