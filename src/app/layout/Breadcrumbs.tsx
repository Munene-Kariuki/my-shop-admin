import { ChevronRight } from 'lucide-react'
import { Fragment } from 'react'
import { Link, useLocation } from 'react-router-dom'

const LABELS: Record<string, string> = {
  dashboard: 'Dashboard',
  shops: 'Shops',
  products: 'Products',
  new: 'New',
  edit: 'Edit',
}

export function Breadcrumbs() {
  const location = useLocation()
  const segments = location.pathname.split('/').filter(Boolean)

  if (segments.length === 0) return null

  const crumbs = segments.map((segment, index) => {
    const path = `/${segments.slice(0, index + 1).join('/')}`
    const isLast = index === segments.length - 1
    const label = LABELS[segment] ?? (isLast ? 'Details' : segment)
    return { label, path, isLast }
  })

  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-1 text-sm text-muted-foreground">
      {crumbs.map((crumb) => (
        <Fragment key={crumb.path}>
          {crumb.isLast ? (
            <span className="font-medium text-foreground" aria-current="page">
              {crumb.label}
            </span>
          ) : (
            <>
              <Link to={crumb.path} className="hover:text-foreground hover:underline">
                {crumb.label}
              </Link>
              <ChevronRight className="size-3.5" aria-hidden="true" />
            </>
          )}
        </Fragment>
      ))}
    </nav>
  )
}
