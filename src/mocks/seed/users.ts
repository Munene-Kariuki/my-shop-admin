import type { User } from '@/types/domain'

export const seedUsers: User[] = [
  {
    id: 'user-admin',
    name: 'Ava Administrator',
    email: 'admin@myshop.test',
    password: 'password123',
    role: 'admin',
  },
  {
    id: 'user-viewer',
    name: 'Victor Viewer',
    email: 'viewer@myshop.test',
    password: 'password123',
    role: 'viewer',
  },
]
