import { SearchX } from 'lucide-react'
import { Link } from 'react-router-dom'
import { EmptyState } from '@/components/common/EmptyState'
import { Button } from '@/components/ui/button'

export function NotFoundPage() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center p-8">
      <EmptyState
        icon={SearchX}
        title="Page not found"
        message="The page you're looking for doesn't exist or may have moved."
        action={
          <Button asChild variant="outline" size="sm">
            <Link to="/">Back to home</Link>
          </Button>
        }
      />
    </div>
  )
}
