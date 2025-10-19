"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useGlobalControl } from "@/components/global-control-provider"

export function SettingsManager() {
  const { logEvent } = useGlobalControl()

  function click(name: string) {
    logEvent(`settings:${name}`)
  }

  return (
    <div className="px-4 lg:px-6 grid grid-cols-1 gap-4">
      <Card>
        <CardHeader className="border-b">
          <CardTitle>API Integrations</CardTitle>
          <CardDescription>Connect external services</CardDescription>
        </CardHeader>
        <CardContent className="py-4">
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => click("integrations_connect")}>Connect Provider</Button>
            <Button variant="outline" onClick={() => click("integrations_refresh")}>Refresh</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="border-b">
          <CardTitle>Model and API Keys</CardTitle>
          <CardDescription>Manage AI models and secrets</CardDescription>
        </CardHeader>
        <CardContent className="py-4 space-y-3">
          <Input placeholder="Model Name" />
          <Input placeholder="API Key" />
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => click("model_save")}>Save</Button>
            <Button variant="outline" onClick={() => click("model_test")}>Test</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="border-b">
          <CardTitle>Payment Gateways</CardTitle>
          <CardDescription>Configure payment providers</CardDescription>
        </CardHeader>
        <CardContent className="py-4">
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => click("payment_connect")}>Connect Gateway</Button>
            <Button variant="outline" onClick={() => click("payment_test")}>Test Payment</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="border-b">
          <CardTitle>User Roles & Permissions</CardTitle>
          <CardDescription>Assign roles and manage access</CardDescription>
        </CardHeader>
        <CardContent className="py-4">
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => click("roles_manage")}>Manage Roles</Button>
            <Button variant="outline" onClick={() => click("permissions_update")}>Update Permissions</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}