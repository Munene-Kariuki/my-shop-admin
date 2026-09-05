import { LayoutDashboard, Package, Store } from 'lucide-react'
import type { ComponentType } from 'react'

export interface NavItem {
  to: string
  label: string
  icon: ComponentType<{ className?: string }>
}

export const navItems: NavItem[] = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/shops', label: 'Shops', icon: Store },
  { to: '/products', label: 'Products', icon: Package },
]
