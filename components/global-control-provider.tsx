"use client"

import React, { createContext, useContext, useEffect, useMemo, useState } from "react"
import { toast } from "sonner"
import type { ActivityItem } from "@/components/activity-feed"

const STORAGE_KEY = "global-control-state-v1"

export type FeatureFlags = {
  analytics: boolean
  marketplace: boolean
  marketing: boolean
  cms: boolean
  reports: boolean
  users: boolean
  content: boolean
  activity: boolean
  settings: boolean
}

export type GlobalControlState = {
  maintenanceMode: boolean
  readOnlyMode: boolean
  featureFlags: FeatureFlags
  impersonationUser: string | null
  events: ActivityItem[]
  setMaintenanceMode: (v: boolean) => void
  setReadOnlyMode: (v: boolean) => void
  setFeatureFlag: (key: keyof FeatureFlags, v: boolean) => void
  setImpersonationUser: (user: string | null) => void
  logEvent: (action: string, target?: string, user?: string) => void
  clearEvents: () => void
}

const defaultFlags: FeatureFlags = {
  analytics: true,
  marketplace: true,
  marketing: true,
  cms: true,
  reports: true,
  users: true,
  content: true,
  activity: true,
  settings: true,
}

const defaultState: GlobalControlState = {
  maintenanceMode: false,
  readOnlyMode: false,
  featureFlags: defaultFlags,
  impersonationUser: null,
  events: [],
  setMaintenanceMode: () => {},
  setReadOnlyMode: () => {},
  setFeatureFlag: () => {},
  setImpersonationUser: () => {},
  logEvent: () => {},
  clearEvents: () => {},
}

const GlobalControlContext = createContext<GlobalControlState>(defaultState)

export function GlobalControlProvider({ children }: { children: React.ReactNode }) {
  const [maintenanceMode, setMaintenanceMode] = useState<boolean>(false)
  const [readOnlyMode, setReadOnlyMode] = useState<boolean>(false)
  const [featureFlags, setFeatureFlags] = useState<FeatureFlags>(defaultFlags)
  const [impersonationUser, setImpersonationUser] = useState<string | null>(null)
  const [events, setEvents] = useState<ActivityItem[]>([])

  // rehydrate from storage
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY)
      if (raw) {
        const parsed = JSON.parse(raw)
        setMaintenanceMode(!!parsed.maintenanceMode)
        setReadOnlyMode(!!parsed.readOnlyMode)
        setFeatureFlags({ ...defaultFlags, ...(parsed.featureFlags ?? {}) })
        setImpersonationUser(parsed.impersonationUser ?? null)
        setEvents(Array.isArray(parsed.events) ? parsed.events : [])
      }
    } catch (e) {
      // ignore
    }
  }, [])

  // persist to storage
  useEffect(() => {
    const payload = {
      maintenanceMode,
      readOnlyMode,
      featureFlags,
      impersonationUser,
      events,
    }
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload))
    } catch (e) {
      // ignore
    }
  }, [maintenanceMode, readOnlyMode, featureFlags, impersonationUser, events])

  const api = useMemo<GlobalControlState>(() => ({
    maintenanceMode,
    readOnlyMode,
    featureFlags,
    impersonationUser,
    events,
    setMaintenanceMode: (v: boolean) => {
      setMaintenanceMode(v)
      toast.info(v ? "Maintenance mode enabled" : "Maintenance mode disabled")
      logEventInternal(v ? "maintenance_on" : "maintenance_off")
    },
    setReadOnlyMode: (v: boolean) => {
      setReadOnlyMode(v)
      toast.info(v ? "Read-only mode enabled" : "Read-only mode disabled")
      logEventInternal(v ? "readonly_on" : "readonly_off")
    },
    setFeatureFlag: (key: keyof FeatureFlags, v: boolean) => {
      setFeatureFlags((prev) => ({ ...prev, [key]: v }))
      toast.success(`${key} ${v ? "enabled" : "disabled"}`)
      logEventInternal(v ? `feature_on:${key}` : `feature_off:${key}`)
    },
    setImpersonationUser: (user: string | null) => {
      setImpersonationUser(user)
      toast.info(user ? `Impersonating ${user}` : "Impersonation cleared")
      logEventInternal(user ? `impersonate:${user}` : "impersonate:clear", undefined, user ?? undefined)
    },
    logEvent: (action: string, target?: string, user?: string) => {
      logEventInternal(action, target, user)
    },
    clearEvents: () => {
      setEvents([])
      toast.warning("Activity events cleared")
    },
  }), [maintenanceMode, readOnlyMode, featureFlags, impersonationUser, events])

  function logEventInternal(action: string, target?: string, user?: string) {
    const now = new Date()
    const time = now.toLocaleString()
    const currentUser = user ?? impersonationUser ?? "admin"
    const evt: ActivityItem = { time, user: currentUser, action, target }
    setEvents((prev) => [evt, ...prev].slice(0, 500))
  }

  return (
    <GlobalControlContext.Provider value={api}>{children}</GlobalControlContext.Provider>
  )
}

export function useGlobalControl() {
  return useContext(GlobalControlContext)
}