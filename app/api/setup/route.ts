import { runMigrations } from "@/lib/database"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    await runMigrations()
    return NextResponse.json({ success: true, message: "Database setup completed" })
  } catch (error) {
    console.error('Migration failed:', error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
