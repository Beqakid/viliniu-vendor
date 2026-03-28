'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { updateOrderStatus } from '@/lib/api'
import { useRouter } from 'next/navigation'
import { ORDER_STATUS_LABELS } from '@/lib/utils'

const STATUS_FLOW = ['pending', 'confirmed', 'preparing', 'out_for_delivery', 'delivered']

interface Props {
  orderId: string
  currentStatus: string
}

export default function OrderStatusUpdater({ orderId, currentStatus }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const currentIndex = STATUS_FLOW.indexOf(currentStatus)

  const handleUpdate = async (status: string) => {
    setLoading(true)
    try {
      const token = document.cookie.split('; ').find(r => r.startsWith('payload-token='))?.split('=')[1]
      if (!token) throw new Error('Not authenticated')
      await updateOrderStatus(orderId, status, token)
      toast.success(`Order status updated to ${ORDER_STATUS_LABELS[status]}`)
      router.refresh()
    } catch (err: any) {
      toast.error(err.message || 'Failed to update status')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-wrap gap-2">
      {STATUS_FLOW.map((status, i) => (
        <button
          key={status}
          onClick={() => handleUpdate(status)}
          disabled={loading || status === currentStatus}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            status === currentStatus
              ? 'bg-brand-600 text-white cursor-default'
              : i < currentIndex
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          {ORDER_STATUS_LABELS[status]}
        </button>
      ))}
      {currentStatus !== 'cancelled' && currentStatus !== 'delivered' && (
        <button
          onClick={() => handleUpdate('cancelled')}
          disabled={loading}
          className="px-4 py-2 rounded-lg text-sm font-medium bg-red-50 text-red-700 hover:bg-red-100 transition-colors"
        >
          Cancel Order
        </button>
      )}
    </div>
  )
}
