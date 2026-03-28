import { cookies } from 'next/headers'
import { getMyVendorProfile, getVendorProducts } from '@/lib/api'
import { formatCurrency } from '@/lib/utils'
import { Plus, Pencil, Package } from 'lucide-react'
import Link from 'next/link'

export default async function ProductsPage() {
  const cookieStore = await cookies()
  const token = cookieStore.get('payload-token')?.value!

  const vendorData = await getMyVendorProfile(token).catch(() => null)
  const vendor = vendorData?.docs?.[0]

  const products = vendor
    ? await getVendorProducts(vendor.id, token).catch(() => ({ docs: [], totalDocs: 0 }))
    : { docs: [], totalDocs: 0 }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Products</h2>
          <p className="text-gray-500 text-sm mt-1">{products.totalDocs} products in your store</p>
        </div>
        <Link
          href="/dashboard/products/new"
          className="flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white font-semibold px-4 py-2.5 rounded-lg transition-colors text-sm"
        >
          <Plus className="w-4 h-4" />
          Add Product
        </Link>
      </div>

      {products.docs.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No products yet</h3>
          <p className="text-gray-500 mb-6">Add your first product to start selling</p>
          <Link href="/dashboard/products/new" className="bg-brand-600 hover:bg-brand-700 text-white font-semibold px-6 py-2.5 rounded-lg transition-colors">
            Add your first product
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">Product</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">Category</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">Price</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">Stock</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">Status</th>
                <th className="px-6 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {products.docs.map((product: any) => (
                <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {product.images?.[0]?.image?.url && (
                        <img src={product.images[0].image.url} alt={product.name} className="w-10 h-10 rounded-lg object-cover" />
                      )}
                      <div>
                        <p className="font-medium text-gray-900 text-sm">{product.name}</p>
                        {product.sku && <p className="text-xs text-gray-500">SKU: {product.sku}</p>}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{product.category}</td>
                  <td className="px-6 py-4 text-sm font-semibold text-gray-900">{formatCurrency(product.price)}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{product.stock} {product.unit}</td>
                  <td className="px-6 py-4">
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${product.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                      {product.active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <Link href={`/dashboard/products/${product.id}`} className="flex items-center gap-1.5 text-xs text-brand-600 hover:text-brand-700 font-medium">
                      <Pencil className="w-3.5 h-3.5" /> Edit
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
