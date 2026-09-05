import { LogOut } from 'lucide-react'
import { Breadcrumbs } from '@/app/layout/Breadcrumbs'
import { MobileNav } from '@/app/layout/MobileNav'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useLogout } from '@/features/auth/hooks'
import { useAuthStore } from '@/features/auth/store'

function initialsFor(name: string): string {
  return name
    .split(' ')
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

export function Topbar() {
  const user = useAuthStore((s) => s.user)
  const logout = useLogout()

  return (
    <header className="flex h-14 items-center justify-between gap-4 border-b bg-background px-4">
      <div className="flex items-center gap-3">
        <MobileNav />
        <Breadcrumbs />
      </div>

      {user && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-secondary/60"
              aria-label={`Account menu for ${user.name}`}
            >
              <Avatar className="size-7">
                <AvatarFallback>{initialsFor(user.name)}</AvatarFallback>
              </Avatar>
              <span className="hidden text-left sm:block">
                <span className="block leading-tight font-medium">{user.name}</span>
                <span className="block text-xs leading-tight text-muted-foreground capitalize">
                  {user.role}
                </span>
              </span>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>
              {user.name}
              <span className="block text-xs font-normal text-muted-foreground">{user.email}</span>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={logout} variant="destructive">
              <LogOut className="size-4" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </header>
  )
}
