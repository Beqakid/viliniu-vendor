import { cookies } from 'next/headers'
import { getMyVendorProfile, getVendorOrders } from '@/lib/api'
import { formatCurrency, formatDate, ORDER_STATUS_COLORS, ORDER_STATUS_LABELS } from '@/lib/utils'
import Link from 'next/link'
import { ShoppingBag } from 'lucide-react'

export const runtime = 'edge'

export default async function OrdersPage() {
  const cookieStore = await cookies()
  const token = cookieStore.get('payload-token')?.value!

  const vendorData = await getMyVendorProfile(token).catch(() => null)
  const vendor = vendorData?.docs?.[0]

  const orders = vendor
    ? await getVendorOrders(vendor.id, token).catch(() => ({ docs: [], totalDocs: 0 }))
    : { docs: [], totalDocs: 0 }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900">Orders</h2>
        <p className="text-gray-500 text-sm mt-1">{orders.totalDocs} total orders</p>
      </div>

      {orders.docs.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <ShoppingBag className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No orders yet</h3>
          <p className="text-gray-500">Orders from customers will appear here</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">Order</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">Customer</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">Date</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">Total</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">Status</th>
                <th className="px-6 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {orders.docs.map((order: any) => (
                <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <p className="font-medium text-gray-900 text-sm">{order.orderNumber}</p>
                    <p className="text-xs text-gray-500">{order.items?.length ?? 0} items</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-gray-900">{order.customer?.name ?? 'Customer'}</p>
                    <p className="text-xs text-gray-500">{order.deliveryCity}</p>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{formatDate(order.createdAt)}</td>
                  <td className="px-6 py-4 text-sm font-semibold text-gray-900">{formatCurrency(order.totalAmount)}</td>
                  <td className="px-6 py-4">
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${ORDER_STATUS_COLORS[order.status]}`}>
                      {ORDER_STATUS_LABELS[order.status]}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <Link href={`/dashboard/orders/${order.id}`} className="text-xs text-brand-600 hover:text-brand-700 font-medium">
                      View →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
