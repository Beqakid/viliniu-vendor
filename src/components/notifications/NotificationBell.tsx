'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Bell } from 'lucide-react'

const API_URL = process.env.NEXT_PUBLIC_PAYLOAD_URL || 'https://multistore.jjioji.workers.dev'

type Notification = {
  id: string
  title: string
  message: string
  type: string
  read: boolean
  link?: string
  createdAt: string
}

export default function NotificationBell({ token }: { token: string }) {
  const [unreadCount, setUnreadCount] = useState(0)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  const headers = {
    'Content-Type': 'application/json',
    Authorization: `JWT ${token}`,
  }

  // Fetch unread count
  const fetchUnreadCount = async () => {
    try {
      const res = await fetch(`${API_URL}/api/notifications/unread-count`, { headers })
      if (res.ok) {
        const data = await res.json()
        setUnreadCount(data.count || 0)
      }
    } catch (e) {
      // silent fail
    }
  }

  // Fetch notifications
  const fetchNotifications = async () => {
    setLoading(true)
    try {
      const res = await fetch(
        `${API_URL}/api/notifications?sort=-createdAt&limit=10`,
        { headers }
      )
      if (res.ok) {
        const data = await res.json()
        setNotifications(data.docs || [])
      }
    } catch (e) {
      // silent fail
    }
    setLoading(false)
  }

  // Mark one as read
  const markAsRead = async (id: string) => {
    try {
      await fetch(`${API_URL}/api/notifications/${id}/read`, {
        method: 'POST',
        headers,
      })
    } catch (e) {}
  }

  // Mark all as read
  const markAllRead = async () => {
    try {
      await fetch(`${API_URL}/api/notifications/mark-all-read`, {
        method: 'POST',
        headers,
      })
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
      setUnreadCount(0)
    } catch (e) {}
  }

  // Handle notification click
  const handleClick = async (notif: Notification) => {
    if (!notif.read) {
      await markAsRead(notif.id)
      setNotifications((prev) =>
        prev.map((n) => (n.id === notif.id ? { ...n, read: true } : n))
      )
      setUnreadCount((c) => Math.max(0, c - 1))
    }
    setOpen(false)
    if (notif.link) {
      router.push(notif.link)
    }
  }

  // Poll unread count
  useEffect(() => {
    fetchUnreadCount()
    const interval = setInterval(fetchUnreadCount, 30000)
    return () => clearInterval(interval)
  }, [])

  // Fetch when dropdown opens
  useEffect(() => {
    if (open) fetchNotifications()
  }, [open])

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 1) return 'Just now'
    if (mins < 60) return `${mins}m ago`
    const hrs = Math.floor(mins / 60)
    if (hrs < 24) return `${hrs}h ago`
    const days = Math.floor(hrs / 24)
    return `${days}d ago`
  }

  const typeIcon = (type: string) => {
    switch (type) {
      case 'new_order': return '\uD83D\uDED2'
      case 'order_status': return '\uD83D\uDCE6'
      case 'vendor_approved': return '\u2705'
      case 'vendor_rejected': return '\u274C'
      default: return '\uD83D\uDD14'
    }
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl shadow-lg border border-gray-200 z-50 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <h3 className="font-semibold text-gray-900 text-sm">Notifications</h3>
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                className="text-xs text-brand-600 hover:text-brand-800 font-medium"
              >
                Mark all read
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto">
            {loading ? (
              <div className="p-4 text-center text-gray-400 text-sm">Loading...</div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center">
                <Bell className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                <p className="text-gray-400 text-sm">No notifications yet</p>
              </div>
            ) : (
              notifications.map((notif) => (
                <button
                  key={notif.id}
                  onClick={() => handleClick(notif)}
                  className={`w-full text-left px-4 py-3 flex gap-3 hover:bg-gray-50 transition-colors border-b border-gray-50 ${
                    !notif.read ? 'bg-blue-50/50' : ''
                  }`}
                >
                  <span className="text-lg flex-shrink-0 mt-0.5">{typeIcon(notif.type)}</span>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm ${!notif.read ? 'font-semibold text-gray-900' : 'text-gray-700'}`}>
                      {notif.title}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{notif.message}</p>
                    <p className="text-[10px] text-gray-400 mt-1">{timeAgo(notif.createdAt)}</p>
                  </div>
                  {!notif.read && (
                    <span className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-2"></span>
                  )}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
