import { useCallback, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'

/**
 * Syncs a flat string-keyed state object with the URL's query params, so list
 * views (search, sort, pagination) can be refreshed or shared without losing
 * their current view. `defaults` should be a stable reference (a module-level
 * constant) since it participates in the memoized state.
 */
export function useUrlState<T extends Record<string, string>>(defaults: T) {
  const [searchParams, setSearchParams] = useSearchParams()

  const state = useMemo(() => {
    const result = { ...defaults }
    for (const key of Object.keys(defaults) as Array<keyof T>) {
      const value = searchParams.get(key as string)
      if (value !== null) {
        result[key] = value as T[keyof T]
      }
    }
    return result
  }, [searchParams, defaults])

  const setState = useCallback(
    (patch: Partial<T>) => {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev)
          for (const key of Object.keys(patch) as Array<keyof T>) {
            const value = patch[key]
            if (value === undefined || value === '' || value === defaults[key]) {
              next.delete(key as string)
            } else {
              next.set(key as string, String(value))
            }
          }
          return next
        },
        { replace: true },
      )
    },
    [setSearchParams, defaults],
  )

  return [state, setState] as const
}
