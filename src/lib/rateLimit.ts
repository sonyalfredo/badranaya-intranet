// In-memory rate limiter (works without Redis for single-server deployments)
// For multi-server, swap with Redis-backed rate-limiter-flexible

interface Attempt {
  count: number
  firstAttempt: number
  blockedUntil?: number
}

const store = new Map<string, Attempt>()

const WINDOW_MS = 15 * 60 * 1000  // 15 minutes
const MAX_ATTEMPTS = 5              // max 5 failed attempts
const BLOCK_MS = 30 * 60 * 1000    // block for 30 minutes

export function checkRateLimit(key: string): { allowed: boolean; remainingAttempts: number; blockedUntilMs?: number } {
  const now = Date.now()
  const entry = store.get(key)

  // If blocked
  if (entry?.blockedUntil && now < entry.blockedUntil) {
    return { allowed: false, remainingAttempts: 0, blockedUntilMs: entry.blockedUntil }
  }

  // Reset if window expired
  if (!entry || now - entry.firstAttempt > WINDOW_MS) {
    store.set(key, { count: 0, firstAttempt: now })
    return { allowed: true, remainingAttempts: MAX_ATTEMPTS }
  }

  const remaining = MAX_ATTEMPTS - entry.count
  return { allowed: remaining > 0, remainingAttempts: Math.max(0, remaining) }
}

export function recordFailedAttempt(key: string): { blocked: boolean; remainingAttempts: number } {
  const now = Date.now()
  const entry = store.get(key) ?? { count: 0, firstAttempt: now }

  entry.count += 1

  if (entry.count >= MAX_ATTEMPTS) {
    entry.blockedUntil = now + BLOCK_MS
    store.set(key, entry)
    return { blocked: true, remainingAttempts: 0 }
  }

  store.set(key, entry)
  return { blocked: false, remainingAttempts: MAX_ATTEMPTS - entry.count }
}

export function resetAttempts(key: string) {
  store.delete(key)
}

// Clean up expired entries every 30 minutes
setInterval(() => {
  const now = Date.now()
  for (const [key, entry] of store.entries()) {
    const expired = entry.blockedUntil
      ? now > entry.blockedUntil
      : now - entry.firstAttempt > WINDOW_MS
    if (expired) store.delete(key)
  }
}, 30 * 60 * 1000)
