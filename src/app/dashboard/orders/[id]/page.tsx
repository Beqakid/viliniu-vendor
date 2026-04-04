import { cookies } from 'next/headers'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { formatCurrency, formatDate, ORDER_STATUS_COLORS, ORDER_STATUS_LABELS, CITY_LABELS } from '@/lib/utils'
import OrderStatusUpdater from './OrderStatusUpdater'

export const runtime = 'edge'

const PAYLOAD_URL = process.env.NEXT_PUBLIC_PAYLOAD_URL || ''

async function getOrder(id: string, token: string) {
  const res = await fetch(`${PAYLOAD_URL}/api/orders/${id}?depth=2`, {
    headers: { Authorization: `JWT ${token}` },
    cache: 'no-store',
  })
  if (!res.ok) return null
  return res.json()
}

export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const cookieStore = await cookies()
  const token = cookieStore.get('payload-token')?.value!
  const order = await getOrder(id, token)

  if (!order) {
    return (
      <div className="p-8">
        <Link href="/dashboard/orders" className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-4">
          <ArrowLeft className="w-4 h-4" /> Back to orders
        </Link>
        <p className="text-gray-500">Order not found.</p>
      </div>
    )
  }

  return (
    <div className="p-8 max-w-3xl">
      <div className="mb-8">
        <Link href="/dashboard/orders" className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-4">
          <ArrowLeft className="w-4 h-4" /> Back to orders
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{order.orderNumber}</h2>
            <p className="text-gray-500 text-sm mt-1">{formatDate(order.createdAt)}</p>
          </div>
          <div className="flex items-center gap-3">
            <span className={`text-sm px-3 py-1.5 rounded-full font-medium ${order.paymentStatus === 'paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
              {order.paymentStatus === 'paid' ? '💳 Paid' : '⏳ Unpaid'}
            </span>
            <span className={`text-sm px-3 py-1.5 rounded-full font-medium ${ORDER_STATUS_COLORS[order.status]}`}>
              {ORDER_STATUS_LABELS[order.status]}
            </span>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {/* Status Progression */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Update Order Status</h3>
          <OrderStatusUpdater orderId={order.id} currentStatus={order.status} token={token} />
        </div>

        {/* Customer & Delivery Info */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Customer & Delivery</h3>
          <dl className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <dt className="text-gray-500">Customer</dt>
              <dd className="font-medium text-gray-900 mt-0.5">{order.customer?.name ?? 'N/A'}</dd>
            </div>
            <div>
              <dt className="text-gray-500">Recipient</dt>
              <dd className="font-medium text-gray-900 mt-0.5">{order.deliveryAddress?.recipientName || order.customer?.name || 'N/A'}</dd>
            </div>
            <div>
              <dt className="text-gray-500">Phone</dt>
              <dd className="font-medium text-gray-900 mt-0.5">{order.deliveryAddress?.phone || order.customer?.phone || 'N/A'}</dd>
            </div>
            <div>
              <dt className="text-gray-500">City</dt>
              <dd className="font-medium text-gray-900 mt-0.5">{CITY_LABELS[order.deliveryAddress?.city] || order.deliveryAddress?.city || 'N/A'}</dd>
            </div>
            <div className="col-span-2">
              <dt className="text-gray-500">Street Address</dt>
              <dd className="font-medium text-gray-900 mt-0.5">{order.deliveryAddress?.street || 'N/A'}</dd>
            </div>
            {order.deliveryAddress?.notes && (
              <div className="col-span-2">
                <dt className="text-gray-500">Delivery Notes</dt>
                <dd className="font-medium text-gray-900 mt-0.5">{order.deliveryAddress.notes}</dd>
              </div>
            )}
            {order.customerNote && (
              <div className="col-span-2">
                <dt className="text-gray-500">Customer Note</dt>
                <dd className="font-medium text-gray-900 mt-0.5">{order.customerNote}</dd>
              </div>
            )}
          </dl>
        </div>

        {/* Order Items */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Order Items</h3>
          <div className="space-y-3">
            {order.items?.map((item: any, i: number) => (
              <div key={i} className="flex items-center justify-between text-sm">
                <div>
                  <p className="font-medium text-gray-900">{item.productName || item.product?.name || 'Product'}</p>
                  <p className="text-gray-500">Qty: {item.quantity} × {formatCurrency(item.unitPrice)}</p>
                </div>
                <p className="font-semibold text-gray-900">{formatCurrency(item.subtotal || item.quantity * item.unitPrice)}</p>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-gray-100 space-y-2 text-sm">
            <div className="flex justify-between text-gray-600"><span>Subtotal</span><span>{formatCurrency(order.subtotal)}</span></div>
            <div className="flex justify-between text-gray-600"><span>Delivery Fee</span><span>{formatCurrency(order.deliveryFee || 0)}</span></div>
            <div className="flex justify-between font-bold text-gray-900 text-base pt-2 border-t border-gray-100"><span>Total</span><span>{formatCurrency(order.totalAmount)}</span></div>
          </div>
        </div>

        {/* Vendor Note */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Vendor Note</h3>
          <p className="text-sm text-gray-600">{order.vendorNote || 'No vendor note added.'}</p>
        </div>
      </div>
    </div>
  )
}
