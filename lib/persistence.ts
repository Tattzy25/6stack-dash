import { promises as fs } from "fs"
import path from "path"

const DATA_DIR = path.join(process.cwd(), "data")
const APPROVALS_FILE = path.join(DATA_DIR, "approvals.json")
const LOGS_FILE = path.join(DATA_DIR, "logs.json")
const TASKS_FILE = path.join(DATA_DIR, "tasks.json")

async function ensureDataDir() {
  try { await fs.mkdir(DATA_DIR, { recursive: true }) } catch {}
}

async function readJson<T>(file: string, fallback: T): Promise<T> {
  try { const raw = await fs.readFile(file, "utf8"); return JSON.parse(raw) as T } catch { return fallback }
}

async function writeJson<T>(file: string, data: T): Promise<void> {
  await ensureDataDir()
  await fs.writeFile(file, JSON.stringify(data, null, 2), "utf8")
}

export type Approval = { id: string; toolId: string; role: string; params: any; status: "pending" | "approved" | "rejected"; createdAt: string; updatedAt?: string }
export type LogEvent = { id: string; type: string; message?: string; data?: any; ts: string }
export type TaskEntry = { id: string; title: string; status: string; createdAt: string; updatedAt?: string }

export async function listApprovals(): Promise<Approval[]> {
  return readJson(APPROVALS_FILE, [])
}

export async function createApproval(a: Approval): Promise<Approval> {
  const list = await listApprovals()
  list.push(a)
  await writeJson(APPROVALS_FILE, list)
  return a
}

export async function updateApproval(id: string, patch: Partial<Approval>): Promise<Approval | null> {
  const list = await listApprovals()
  const idx = list.findIndex((x) => x.id === id)
  if (idx === -1) return null
  list[idx] = { ...list[idx], ...patch, updatedAt: new Date().toISOString() }
  await writeJson(APPROVALS_FILE, list)
  return list[idx]
}

export async function log(evt: LogEvent): Promise<void> {
  const list = await readJson<LogEvent[]>(LOGS_FILE, [])
  list.push(evt)
  await writeJson(LOGS_FILE, list)
}

export async function listTasks(): Promise<TaskEntry[]> {
  return readJson(TASKS_FILE, [])
}

export async function saveTasks(tasks: TaskEntry[]): Promise<void> {
  await writeJson(TASKS_FILE, tasks)
}

// SQL provider stubs for future migration
export const SQLProvider = {
  async upsertApproval(_a: Approval) { /* TODO: implement SQL */ },
  async listApprovals() { /* TODO: implement SQL */ return [] as Approval[] },
}