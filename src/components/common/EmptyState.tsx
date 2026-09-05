import { Inbox } from 'lucide-react'
import type { ComponentType, ReactNode } from 'react'

interface EmptyStateProps {
  icon?: ComponentType<{ className?: string }>
  title: string
  message?: string
  action?: ReactNode
}

export function EmptyState({ icon: Icon = Inbox, title, message, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed p-10 text-center">
      <Icon className="size-8 text-muted-foreground" aria-hidden="true" />
      <div className="space-y-1">
        <p className="font-medium">{title}</p>
        {message && <p className="text-sm text-muted-foreground">{message}</p>}
      </div>
      {action}
    </div>
  )
}
