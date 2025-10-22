type BucketKey = string

const memoryBuckets = new Map<BucketKey, { tokens: number; lastRefill: number; limit: number; windowMs: number }>()

let externalStore: null | {
  get: (key: string) => Promise<{ tokens: number; lastRefill: number; limit: number; windowMs: number } | null>
  set: (key: string, value: { tokens: number; lastRefill: number; limit: number; windowMs: number }) => Promise<void>
} = null

export function setExternalStore(store: NonNullable<typeof externalStore>) {
  externalStore = store
}

export function initBucket(key: BucketKey, limit: number, windowSec: number) {
  const windowMs = windowSec * 1000
  if (!memoryBuckets.has(key)) {
    memoryBuckets.set(key, { tokens: limit, lastRefill: Date.now(), limit, windowMs })
  }
}

export async function takeToken(key: BucketKey): Promise<boolean> {
  const now = Date.now()
  if (externalStore) {
    const b = (await externalStore.get(key)) || memoryBuckets.get(key)
    if (!b) return false
    const elapsed = now - b.lastRefill
    if (elapsed >= b.windowMs) {
      b.tokens = b.limit
      b.lastRefill = now
    }
    if (b.tokens > 0) {
      b.tokens -= 1
      await externalStore.set(key, b)
      return true
    }
    await externalStore.set(key, b)
    return false
  }
  const bucket = memoryBuckets.get(key)
  if (!bucket) return false
  const elapsed = now - bucket.lastRefill
  if (elapsed >= bucket.windowMs) {
    bucket.tokens = bucket.limit
    bucket.lastRefill = now
  }
  if (bucket.tokens > 0) {
    bucket.tokens -= 1
    return true
  }
  return false
}

export function bucketStatus(key: BucketKey) {
  const b = memoryBuckets.get(key)
  return b ? { tokens: b.tokens, resetInMs: b.windowMs - (Date.now() - b.lastRefill) } : null
}