import { cookies } from 'next/headers'
import { getMe, getMyVendorProfile, getMyStaffRole, getVendorOrders, getVendorProducts } from '@/lib/api'
import { formatCurrency, ORDER_STATUS_COLORS, ORDER_STATUS_LABELS, formatDate } from '@/lib/utils'
import { Package, ShoppingBag, DollarSign, Clock } from 'lucide-react'

export const runtime = 'edge'

export default async function DashboardPage() {
  const cookieStore = await cookies()
  const token = cookieStore.get('payload-token')?.value!

  const meData = await getMe(token).catch(() => null)

  // Determine vendor context — owner or staff member
  let vendorId: string | null = null
  let myRole = 'store_owner'
  let storeName = ''
  let isStaffMember = false
  let vendorApproved = true

  // First try: direct vendor profile (store owner)
  const vendorData = await getMyVendorProfile(token).catch(() => null)
  const vendor = vendorData?.docs?.[0]
  if (vendor) {
    vendorId = vendor.id
    storeName = vendor.storeName || ''
    vendorApproved = vendor.approved !== false
  }

  // Second try: staff role lookup
  if (!vendorId) {
    const roleData = await getMyStaffRole(token).catch(() => null)
    if (roleData) {
      vendorId = String(roleData.vendorId)
      myRole = roleData.role
      storeName = roleData.storeName || ''
      isStaffMember = true
    }
  }

  let stats = { products: 0, orders: 0, revenue: 0, pending: 0 }
  let recentOrders: any[] = []
  const isDriver = myRole === 'delivery_driver'

  if (vendorId) {
    const [products, orders] = await Promise.all([
      isDriver ? Promise.resolve({ docs: [], totalDocs: 0 }) : getVendorProducts(vendorId, token).catch(() => ({ docs: [], totalDocs: 0 })),
      getVendorOrders(vendorId, token).catch(() => ({ docs: [], totalDocs: 0 })),
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
          Welcome back, {meData?.user?.name?.split(' ')[0] ?? 'there'} 👋
        </h2>

        {/* Staff role banner */}
        {isStaffMember && (
          <div className="mt-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              You&apos;re logged in as{' '}
              <span className="font-semibold">
                {myRole === 'store_manager'
                  ? 'Store Manager'
                  : myRole === 'store_staff'
                    ? 'Store Staff'
                    : myRole === 'delivery_driver'
                      ? 'Delivery Driver'
                      : myRole.replace(/_/g, ' ')}
              </span>
              {storeName ? (
                <>
                  {' '}at <span className="font-semibold">{storeName}</span>
                </>
              ) : null}
            </p>
          </div>
        )}

        {vendor && !vendorApproved && (
          <div className="mt-3 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">⏳ Your store is pending admin approval. You can still add products in the meantime.</p>
          </div>
        )}
        {!vendorId && (
          <div className="mt-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              👋 Welcome! <a href="/dashboard/store" className="font-semibold underline">Set up your store</a> to get started.
            </p>
          </div>
        )}
      </div>

      <div className={`grid grid-cols-1 sm:grid-cols-2 ${isDriver ? 'lg:grid-cols-2' : 'lg:grid-cols-4'} gap-6 mb-8`}>
        {!isDriver && (
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-gray-500">Total Products</span>
              <div className="p-2 rounded-lg text-blue-600 bg-blue-50">
                <Package className="w-5 h-5" />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900">{stats.products}</p>
          </div>
        )}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-gray-500">Total Orders</span>
            <div className="p-2 rounded-lg text-purple-600 bg-purple-50">
              <ShoppingBag className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats.orders}</p>
        </div>
        {!isDriver && (
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-gray-500">Revenue</span>
              <div className="p-2 rounded-lg text-green-600 bg-green-50">
                <DollarSign className="w-5 h-5" />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.revenue)}</p>
          </div>
        )}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-gray-500">Pending Orders</span>
            <div className="p-2 rounded-lg text-orange-600 bg-orange-50">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
        </div>
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
