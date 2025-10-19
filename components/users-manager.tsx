"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
import { useGlobalControl } from "@/components/global-control-provider"

export type User = {
  id: string
  name: string
  email: string
  role: "admin" | "user"
  active: boolean
  lastActive?: string
}

export type UsersManagerProps = {
  users?: User[]
}

export function UsersManager({ users = [] }: UsersManagerProps) {
  const { logEvent } = useGlobalControl()

  const hasUsers = users.length > 0

  function handleActivate(u: User, v: boolean) {
    logEvent(v ? "user_activate" : "user_deactivate", u.id, u.email)
  }
  function handleRole(u: User, role: "admin" | "user") {
    logEvent(role === "admin" ? "user_make_admin" : "user_make_user", u.id, u.email)
  }
  function handleView(u: User) {
    logEvent("user_view_profile", u.id, u.email)
  }
  function handleHistory(u: User) {
    logEvent("user_view_history", u.id, u.email)
  }

  return (
    <div className="px-4 lg:px-6 grid grid-cols-1 gap-4">
      <Card>
        <CardHeader className="border-b">
          <CardTitle>All Users</CardTitle>
          <CardDescription>Manage roles, status, and profiles</CardDescription>
        </CardHeader>
        <CardContent>
          {hasUsers ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last Active</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((u) => (
                  <TableRow key={u.id}>
                    <TableCell>{u.name}</TableCell>
                    <TableCell>{u.email}</TableCell>
                    <TableCell className="capitalize">{u.role}</TableCell>
                    <TableCell>{u.active ? "Active" : "Inactive"}</TableCell>
                    <TableCell>{u.lastActive ?? "—"}</TableCell>
                    <TableCell className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => handleActivate(u, !u.active)}>
                        {u.active ? "Deactivate" : "Activate"}
                      </Button>
                      {u.role === "admin" ? (
                        <Button variant="outline" size="sm" onClick={() => handleRole(u, "user")}>Make User</Button>
                      ) : (
                        <Button variant="outline" size="sm" onClick={() => handleRole(u, "admin")}>Make Admin</Button>
                      )}
                      <Button variant="outline" size="sm" onClick={() => handleView(u)}>View Profile</Button>
                      <Button variant="outline" size="sm" onClick={() => handleHistory(u)}>View History</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <Empty className="border mt-6">
              <EmptyMedia variant="icon" />
              <EmptyHeader>
                <EmptyTitle>No users</EmptyTitle>
                <EmptyDescription>Add users or connect data source to populate.</EmptyDescription>
              </EmptyHeader>
            </Empty>
          )}
        </CardContent>
      </Card>
    </div>
  )
}