"use client"

import React, { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { useGlobalControl } from "@/components/global-control-provider"
import { toast } from "sonner"

export function CommandCenter() {
  const {
    maintenanceMode,
    readOnlyMode,
    featureFlags,
    impersonationUser,
    setMaintenanceMode,
    setReadOnlyMode,
    setFeatureFlag,
    setImpersonationUser,
    logEvent,
  } = useGlobalControl()

  const [impersonateInput, setImpersonateInput] = useState<string>(impersonationUser ?? "")

  function runTask(name: string, target?: string) {
    toast.loading(`${name} started...`, { id: name })
    setTimeout(() => {
      toast.success(`${name} completed`, { id: name })
      logEvent(`task:${name.toLowerCase().replace(/\s+/g, "_")}`, target)
    }, 600)
  }

  return (
    <div className="px-4 lg:px-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
      <Card>
        <CardHeader className="border-b">
          <CardTitle>System Controls</CardTitle>
          <CardDescription>Toggle global modes for operations</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-3 sm:grid-cols-2 py-4">
          <Label>
            <Checkbox
              checked={maintenanceMode}
              onCheckedChange={(v) => setMaintenanceMode(Boolean(v))}
            />
            Maintenance mode
          </Label>
          <Label>
            <Checkbox
              checked={readOnlyMode}
              onCheckedChange={(v) => setReadOnlyMode(Boolean(v))}
            />
            Read-only mode
          </Label>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="border-b">
          <CardTitle>Feature Flags</CardTitle>
          <CardDescription>Enable or disable major areas</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 py-4">
          {(Object.keys(featureFlags) as Array<keyof typeof featureFlags>).map((key) => (
            <Label key={key} className="capitalize">
              <Checkbox
                checked={featureFlags[key]}
                onCheckedChange={(v) => setFeatureFlag(key, Boolean(v))}
              />
              {key}
            </Label>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="border-b">
          <CardTitle>Impersonation</CardTitle>
          <CardDescription>Act as a specific user for testing</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center gap-2 py-4">
          <Input
            placeholder="username or email"
            value={impersonateInput}
            onChange={(e) => setImpersonateInput(e.target.value)}
          />
          <Button
            variant="outline"
            onClick={() => setImpersonationUser(impersonateInput || null)}
          >
            Apply
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              setImpersonationUser(null)
              setImpersonateInput("")
            }}
          >
            Clear
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="border-b">
          <CardTitle>Task Runner</CardTitle>
          <CardDescription>Run common ops tasks</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-2 sm:grid-cols-2 py-4">
          <Button variant="outline" onClick={() => runTask("Reindex Content", "content")}>Reindex Content</Button>
          <Button variant="outline" onClick={() => runTask("Purge Cache", "system")}>Purge Cache</Button>
          <Button variant="outline" onClick={() => runTask("Backup Database", "db")}>Backup Database</Button>
          <Button variant="outline" onClick={() => runTask("Rotate Keys", "security")}>Rotate Keys</Button>
        </CardContent>
      </Card>
    </div>
  )
}