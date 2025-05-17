"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { fetchUsers, deleteUser } from "@/lib/api"
import { Trash2 } from "lucide-react"

interface User {
  id: number
  name: string
  email: string
  profilePictureUrl: string
}

export function UserList() {
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  const loadUsers = async () => {
    setIsLoading(true)
    try {
      const data = await fetchUsers()
      setUsers(data)
    } catch (error) {
      console.error("Error fetching users:", error)
      toast({
        title: "Error",
        description: "Failed to load users",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadUsers()
  }, [])

  const handleDelete = async (id: number) => {
    try {
      await deleteUser(id)
      setUsers(users.filter((user) => user.id !== id))
      toast({
        title: "User deleted",
        description: "User has been successfully deleted",
      })
    } catch (error) {
      console.error("Error deleting user:", error)
      toast({
        title: "Error",
        description: "Failed to delete user",
        variant: "destructive",
      })
    }
  }

  if (isLoading) {
    return <div className="text-center py-4">Loading users...</div>
  }

  if (users.length === 0) {
    return <div className="text-center py-4">No users found. Add a new user to get started.</div>
  }

  return (
    <div className="space-y-4">
      {users.map((user) => (
        <Card key={user.id} className="p-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <img
              src={user.profilePictureUrl || "/placeholder.svg"}
              alt={`${user.name}'s profile`}
              className="w-12 h-12 rounded-full object-cover"
              onError={(e) => {
                ;(e.target as HTMLImageElement).src = "/placeholder.svg?height=48&width=48"
              }}
            />
            <div>
              <h3 className="font-medium">{user.name}</h3>
              <p className="text-sm text-gray-500">{user.email}</p>
            </div>
          </div>
          <Button variant="destructive" size="icon" onClick={() => handleDelete(user.id)}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </Card>
      ))}
    </div>
  )
}
