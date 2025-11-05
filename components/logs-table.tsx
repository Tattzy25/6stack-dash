"use client"

import { useMemo, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export type LogItem = {
  time: string
  user: string
  action: string
  target?: string
}

export type LogsTableProps = {
  items?: LogItem[]
  title?: string
  description?: string
}

export function LogsTable({ items = [], title = "Logs", description = "Recent events" }: LogsTableProps) {
  const [query, setQuery] = useState("")
  const [limit, setLimit] = useState(50)

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    const arr = q
      ? items.filter((i) =>
          [i.time, i.user, i.action, i.target ?? ""].some((v) => String(v).toLowerCase().includes(q))
        )
      : items
    return arr.slice(0, limit)
  }, [items, query, limit])

  return (
    <Card>
      <CardHeader className="border-b">
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 py-4">
        <div className="flex flex-col sm:flex-row gap-2 sm:items-center sm:justify-between">
          <Input
            placeholder="Search logs…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full sm:w-64"
          />
          <Select value={String(limit)} onValueChange={(v) => setLimit(Number(v))}>
            <SelectTrigger className="w-28">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="25">25</SelectItem>
              <SelectItem value="50">50</SelectItem>
              <SelectItem value="100">100</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Time</TableHead>
              <TableHead>User</TableHead>
              <TableHead>Action</TableHead>
              <TableHead>Target</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((item, idx) => (
              <TableRow key={idx}>
                <TableCell>{item.time}</TableCell>
                <TableCell>{item.user}</TableCell>
                <TableCell>{item.action}</TableCell>
                <TableCell>{item.target ?? "—"}</TableCell>
              </TableRow>
            ))}
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground py-6">
                  No logs found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}