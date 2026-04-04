import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import Sidebar from '@/components/layout/Sidebar'
import NotificationBell from '@/components/notifications/NotificationBell'

export const runtime = 'edge'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies()
  const token = cookieStore.get('payload-token')?.value

  if (!token) {
    redirect('/login')
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-auto">
        <header className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-end sticky top-0 z-40">
          <NotificationBell token={token} />
        </header>
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
