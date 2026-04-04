'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from '@/lib/utils'
import { ArrowRight, XCircle } from 'lucide-react'

const PAYLOAD_URL = process.env.NEXT_PUBLIC_PAYLOAD_URL || ''

// Vendor can progress through these statuses
const VENDOR_STATUS_FLOW = [
  { key: 'pending', label: 'Pending', icon: '⏳' },
  { key: 'confirmed', label: 'Confirmed', icon: '✅' },
  { key: 'packed', label: 'Packed', icon: '📦' },
  { key: 'ready_for_delivery', label: 'Ready for Delivery', icon: '🚚' },
]

// These are set by the delivery driver (post-MVP)
// For now, vendor can also set these since there's no driver app yet
const DRIVER_STATUSES = [
  { key: 'out_for_delivery', label: 'Out for Delivery', icon: '🛵' },
  { key: 'delivered', label: 'Delivered', icon: '✅' },
]

const ALL_STATUSES = [...VENDOR_STATUS_FLOW, ...DRIVER_STATUSES]

interface Props {
  orderId: string
  currentStatus: string
  token: string
}

export default function OrderStatusUpdater({ orderId, currentStatus, token }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const currentIndex = ALL_STATUSES.findIndex(s => s.key === currentStatus)
  const isTerminal = currentStatus === 'delivered' || currentStatus === 'cancelled'

  const handleUpdate = async (status: string) => {
    setLoading(true)
    try {
      const res = await fetch(`${PAYLOAD_URL}/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `JWT ${token}`,
        },
        body: JSON.stringify({ status }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.errors?.[0]?.message || `Failed to update (${res.status})`)
      }
      toast.success(`Order status updated to ${ORDER_STATUS_LABELS[status] || status}`)
      router.refresh()
    } catch (err: any) {
      toast.error(err.message || 'Failed to update status')
    } finally {
      setLoading(false)
    }
  }

  if (isTerminal) {
    return (
      <div className="text-sm text-gray-500">
        This order is <strong>{ORDER_STATUS_LABELS[currentStatus]}</strong>. No further status updates.
      </div>
    )
  }

  // Find the next status in the flow
  const nextStatus = currentIndex >= 0 && currentIndex < ALL_STATUSES.length - 1
    ? ALL_STATUSES[currentIndex + 1]
    : null

  return (
    <div className="space-y-6">
      {/* Status Progress Bar */}
      <div className="flex items-center gap-1 overflow-x-auto pb-2">
        {ALL_STATUSES.map((status, i) => {
          const isCompleted = i < currentIndex
          const isCurrent = i === currentIndex

          return (
            <div key={status.key} className="flex items-center">
              <div className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap ${
                isCurrent
                  ? ORDER_STATUS_COLORS[status.key] || 'bg-blue-100 text-blue-800'
                  : isCompleted
                  ? 'bg-green-50 text-green-600'
                  : 'bg-gray-50 text-gray-400'
              }`}>
                <span>{status.icon}</span>
                <span>{status.label}</span>
              </div>
              {i < ALL_STATUSES.length - 1 && (
                <ArrowRight className={`w-3 h-3 mx-1 flex-shrink-0 ${isCompleted ? 'text-green-400' : 'text-gray-300'}`} />
              )}
            </div>
          )
        })}
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3">
        {nextStatus && (
          <button
            onClick={() => handleUpdate(nextStatus.key)}
            disabled={loading}
            className="flex items-center gap-2 px-5 py-2.5 bg-brand-600 text-white rounded-lg text-sm font-medium hover:bg-brand-700 transition-colors disabled:opacity-50"
          >
            {loading ? 'Updating...' : `${nextStatus.icon} Move to ${nextStatus.label}`}
          </button>
        )}
        <button
          onClick={() => handleUpdate('cancelled')}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2.5 bg-red-50 text-red-700 rounded-lg text-sm font-medium hover:bg-red-100 transition-colors disabled:opacity-50"
        >
          <XCircle className="w-4 h-4" /> Cancel Order
        </button>
      </div>

      {currentIndex >= VENDOR_STATUS_FLOW.length - 1 && currentStatus === 'ready_for_delivery' && (
        <p className="text-xs text-gray-500 italic">
          💡 Once the delivery driver picks up the order, they will update the status to "Out for Delivery" and "Delivered" from the Driver App.
          For now, you can also advance the status manually.
        </p>
      )}
    </div>
  )
}
