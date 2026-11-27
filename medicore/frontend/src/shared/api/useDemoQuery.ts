import { useEffect, useState } from 'react'
import type { UserRole } from '../types'
import { demoApi } from './demoApi'

export function useDemoQuery<T>(role: UserRole, path: string | null) {
  const key = path ? `${role}:${path}` : null
  const [result, setResult] = useState<{ key: string; data: T | null; error: Error | null }>()
  useEffect(() => {
    if (!key || !path) return
    const controller = new AbortController()
    demoApi<T>(role, path, { signal: controller.signal }).then(
      (data) => { if (!controller.signal.aborted) setResult({ key, data, error: null }) },
      (error: Error) => { if (!controller.signal.aborted) setResult({ key, data: null, error }) },
    )
    return () => controller.abort()
  }, [key, path, role])
  const current = key && result?.key === key ? result : undefined
  return { loading: Boolean(key && !current), data: current?.data ?? null, error: current?.error ?? null }
}
