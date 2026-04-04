import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import Sidebar from '@/components/layout/Sidebar'
import NotificationBell from '@/components/notifications/NotificationBell'

export const runtime = 'edge'

const PAYLOAD_URL = process.env.NEXT_PUBLIC_PAYLOAD_URL || ''

async function fetchUser(token: string) {
  try {
    const res = await fetch(`${PAYLOAD_URL}/api/users/me`, {
      headers: { Authorization: `JWT ${token}` },
    })
    if (!res.ok) return null
    const data = await res.json()
    return data?.user || null
  } catch {
    return null
  }
}

async function fetchVendorProfile(userId: number, token: string) {
  try {
    const res = await fetch(
      `${PAYLOAD_URL}/api/vendors?where[user][equals]=${userId}&limit=1`,
      { headers: { Authorization: `JWT ${token}` } }
    )
    if (!res.ok) return null
    const data = await res.json()
    return data?.docs?.[0] || null
  } catch {
    return null
  }
}

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies()
  const token = cookieStore.get('payload-token')?.value

  if (!token) {
    redirect('/login')
  }

  const user = await fetchUser(token)
  const vendor = user ? await fetchVendorProfile(user.id, token) : null

  const userName = user?.name || user?.email || 'User'
  const storeName = vendor?.storeName || 'My Store'
  const userRole = user?.role || 'vendor'

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar userName={userName} storeName={storeName} userRole={userRole} />
      <div className="flex-1 flex flex-col overflow-auto">
        <header className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between sticky top-0 z-40">
          <h2 className="text-lg font-semibold text-gray-900">{storeName}</h2>
          <NotificationBell token={token} />
        </header>
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
