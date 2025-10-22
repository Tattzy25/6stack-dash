"use client"

import { useState } from "react"

export default function SandboxPage() {
  const [code, setCode] = useState('print("hello world")')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ logs?: string, files?: any, error?: string } | null>(null)

  async function run() {
    setLoading(true)
    setResult(null)
    try {
      const res = await fetch('/api/e2b', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code })
      })
      const data = await res.json()
      setResult(data)
    } catch (e: any) {
      setResult({ error: e?.message || String(e) })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-xl font-semibold">E2B Sandbox</h1>
      <p className="text-sm text-muted-foreground">Runs Python code in an isolated sandbox and shows logs and files.</p>

      <textarea
        className="w-full h-40 border rounded p-2 text-sm"
        value={code}
        onChange={(e) => setCode(e.target.value)}
      />

      <button
        className="px-3 py-2 rounded bg-blue-600 text-white disabled:opacity-50"
        disabled={loading}
        onClick={run}
      >{loading ? 'Running…' : 'Run in Sandbox'}</button>

      {result && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="border rounded p-3">
            <h2 className="font-medium">Logs</h2>
            <pre className="text-sm whitespace-pre-wrap">{result.logs || ''}</pre>
            {result.error && <p className="text-red-600 text-sm">Error: {result.error}</p>}
          </div>
          <div className="border rounded p-3">
            <h2 className="font-medium">Files (/)</h2>
            <pre className="text-sm whitespace-pre-wrap">{JSON.stringify(result.files, null, 2)}</pre>
          </div>
        </div>
      )}
    </div>
  )
}