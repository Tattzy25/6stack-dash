"use client"

import { useGlobalControl } from "@/components/global-control-provider"

export function MaintenanceBanner() {
  const { maintenanceMode, readOnlyMode } = useGlobalControl()

  if (!maintenanceMode && !readOnlyMode) return null

  return (
    <div className="bg-destructive/10 text-destructive-foreground border-destructive border-b px-4 py-2 text-sm">
      {maintenanceMode && (
        <span className="font-medium">Maintenance mode</span>
      )}
      {maintenanceMode && readOnlyMode && <span className="mx-2">•</span>}
      {readOnlyMode && (
        <span className="font-medium">Read-only mode</span>
      )}
      <span className="ml-2 opacity-80">Some actions may be disabled.</span>
    </div>
  )
}