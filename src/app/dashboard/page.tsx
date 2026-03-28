import { cookies } from 'next/headers'
import { getMe, getMyVendorProfile, getVendorOrders, getVendorProducts } from '@/lib/api'
import { formatCurrency, ORDER_STATUS_COLORS, ORDER_STATUS_LABELS, formatDate } from '@/lib/utils'
import { Package, ShoppingBag, DollarSign, Clock } from 'lucide-react'

export const runtime = 'edge'

export default async function DashboardPage() {
  const cookieStore = await cookies()
  const token = cookieStore.get('payload-token')?.value!

  const meData = await getMe(token).catch(() => null)
  const vendorData = await getMyVendorProfile(token).catch(() => null)
  const vendor = vendorData?.docs?.[0]

  let stats = { products: 0, orders: 0, revenue: 0, pending: 0 }
  let recentOrders: any[] = []

  if (vendor) {
    const [products, orders] = await Promise.all([
      getVendorProducts(vendor.id, token).catch(() => ({ docs: [], totalDocs: 0 })),
      getVendorOrders(vendor.id, token).catch(() => ({ docs: [], totalDocs: 0 })),
    ])
    stats.products = products.totalDocs
    stats.orders = orders.totalDocs
    stats.revenue = orders.docs.filter((o: any) => o.paymentStatus === 'paid').reduce((sum: number, o: any) => sum + o.totalAmount, 0)
    stats.pending = orders.docs.filter((o: any) => o.status === 'pending').length
    recentOrders = orders.docs.slice(0, 5)
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900">
          Welcome back, {meData?.user?.name?.split(' ')[0] ?? 'Vendor'} 👋
        </h2>
        {vendor && !vendor.approved && (
          <div className="mt-3 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">⏳ Your store is pending admin approval. You can still add products in the meantime.</p>
          </div>
        )}
        {!vendor && (
          <div className="mt-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              👋 Welcome! <a href="/dashboard/store" className="font-semibold underline">Set up your store</a> to get started.
            </p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[
          { label: 'Total Products', value: stats.products, icon: Package, color: 'text-blue-600 bg-blue-50' },
          { label: 'Total Orders', value: stats.orders, icon: ShoppingBag, color: 'text-purple-600 bg-purple-50' },
          { label: 'Revenue', value: formatCurrency(stats.revenue), icon: DollarSign, color: 'text-green-600 bg-green-50' },
          { label: 'Pending Orders', value: stats.pending, icon: Clock, color: 'text-orange-600 bg-orange-50' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-gray-500">{label}</span>
              <div className={`p-2 rounded-lg ${color}`}>
                <Icon className="w-5 h-5" />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
          </div>
        ))}
      </div>

      {recentOrders.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200">
          <div className="p-6 border-b border-gray-200 flex items-center justify-between">
            <h3 className="font-semibold text-gray-900">Recent Orders</h3>
            <a href="/dashboard/orders" className="text-sm text-brand-600 hover:text-brand-700 font-medium">View all</a>
          </div>
          <div className="divide-y divide-gray-100">
            {recentOrders.map((order) => (
              <div key={order.id} className="p-4 flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900 text-sm">{order.orderNumber}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{formatDate(order.createdAt)}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${ORDER_STATUS_COLORS[order.status]}`}>
                    {ORDER_STATUS_LABELS[order.status]}
                  </span>
                  <span className="text-sm font-semibold text-gray-900">{formatCurrency(order.totalAmount)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
