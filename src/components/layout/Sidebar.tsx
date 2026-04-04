'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Package, ShoppingBag, Store, Users, LogOut, User } from 'lucide-react'
import { cn } from '@/lib/utils'
import { logoutAction } from '@/lib/auth-actions'
import { useRouter } from 'next/navigation'

const nav = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/dashboard/products', label: 'Products', icon: Package },
  { href: '/dashboard/orders', label: 'Orders', icon: ShoppingBag },
  { href: '/dashboard/team', label: 'Team', icon: Users },
  { href: '/dashboard/store', label: 'Store Settings', icon: Store },
]

interface SidebarProps {
  userName: string
  storeName: string
  userRole: string
}

export default function Sidebar({ userName, storeName, userRole }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()

  const handleLogout = async () => {
    await logoutAction()
    router.push('/login')
    router.refresh()
  }

  const roleLabel = userRole === 'admin' ? 'Admin' : 'Vendor'

  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col min-h-screen">
      <div className="p-6 border-b border-gray-200">
        <h1 className="text-xl font-bold text-gray-900">
          <span className="text-brand-600">Viliniu</span> Vendor
        </h1>
      </div>

      {/* Logged-in user info */}
      <div className="px-4 py-3 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-brand-100 flex items-center justify-center flex-shrink-0">
            <User className="w-4 h-4 text-brand-700" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">{userName}</p>
            <p className="text-xs text-gray-500">{roleLabel}</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {nav.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || (href !== '/dashboard' && pathname.startsWith(href))
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                active
                  ? 'bg-brand-50 text-brand-700'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              )}
            >
              <Icon className="w-5 h-5" />
              {label}
            </Link>
          )
        })}
      </nav>

      <div className="p-4 border-t border-gray-200">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-red-50 hover:text-red-700 w-full transition-colors"
        >
          <LogOut className="w-5 h-5" />
          Sign out
        </button>
      </div>
    </aside>
  )
}
