/** Shared helpers for MSW handlers: network realism, pagination, sorting, filtering. */

/** Small artificial delay so loading states are visible instead of instant. */
export function delay(ms = 350): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export function jsonError(message: string, status: number) {
  return { body: { message }, status }
}

export interface ListParams {
  page: number
  pageSize: number
  sort: string | null
  sortDir: 'asc' | 'desc'
  search: string | null
}

const DEFAULT_PAGE_SIZE = 10

export function parseListParams(
  searchParams: URLSearchParams,
  defaults: Partial<ListParams> = {},
): ListParams {
  const page = Number(searchParams.get('page') ?? defaults.page ?? 1) || 1
  const pageSize = Number(searchParams.get('pageSize') ?? defaults.pageSize ?? DEFAULT_PAGE_SIZE) || DEFAULT_PAGE_SIZE
  const sort = searchParams.get('sort') ?? defaults.sort ?? null
  const sortDir = (searchParams.get('sortDir') as 'asc' | 'desc' | null) ?? defaults.sortDir ?? 'asc'
  const search = searchParams.get('search') ?? defaults.search ?? null

  return { page, pageSize, sort, sortDir, search }
}

export function sortItems<T>(items: T[], sort: string | null, sortDir: 'asc' | 'desc'): T[] {
  if (!sort) return items

  const factor = sortDir === 'desc' ? -1 : 1
  return [...items].sort((a, b) => {
    const aValue = (a as Record<string, unknown>)[sort]
    const bValue = (b as Record<string, unknown>)[sort]

    if (typeof aValue === 'number' && typeof bValue === 'number') {
      return (aValue - bValue) * factor
    }
    return String(aValue).localeCompare(String(bValue)) * factor
  })
}

export interface PaginatedResult<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

export function paginate<T>(items: T[], page: number, pageSize: number): PaginatedResult<T> {
  const total = items.length
  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  const safePage = Math.min(Math.max(1, page), totalPages)
  const start = (safePage - 1) * pageSize
  const data = items.slice(start, start + pageSize)

  return { data, total, page: safePage, pageSize, totalPages }
}
