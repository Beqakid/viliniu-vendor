'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { createProduct, getMyVendorProfile } from '@/lib/api'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

const CATEGORIES = [
  { label: 'Groceries', value: 'groceries' },
  { label: 'Fresh Produce', value: 'produce' },
  { label: 'Bakery', value: 'bakery' },
  { label: 'Beverages', value: 'beverages' },
  { label: 'Dairy & Eggs', value: 'dairy' },
  { label: 'Meat & Seafood', value: 'meat' },
  { label: 'Frozen Foods', value: 'frozen' },
  { label: 'Snacks & Confectionery', value: 'snacks' },
  { label: 'Household & Cleaning', value: 'household' },
  { label: 'Personal Care', value: 'personal_care' },
  { label: 'Baby & Kids', value: 'baby' },
  { label: 'Electronics', value: 'electronics' },
  { label: 'Clothing', value: 'clothing' },
  { label: 'Hardware', value: 'hardware' },
  { label: 'Other', value: 'other' },
]

const UNITS = [
  { label: 'Item', value: 'item' },
  { label: 'Kilogram (kg)', value: 'kg' },
  { label: 'Gram (g)', value: 'g' },
  { label: 'Litre (L)', value: 'L' },
  { label: 'Millilitre (ml)', value: 'ml' },
  { label: 'Pack', value: 'pack' },
  { label: 'Bundle', value: 'bundle' },
  { label: 'Dozen', value: 'dozen' },
]

const schema = z.object({
  name: z.string().min(2),
  description: z.string().optional(),
  price: z.coerce.number().min(0.01, 'Price must be greater than 0'),
  category: z.string().min(1, 'Please select a category'),
  stock: z.coerce.number().min(0),
  unit: z.string().min(1),
  sku: z.string().optional(),
  active: z.boolean(),
})

type FormData = z.infer<typeof schema>

export default function NewProductClient({ token }: { token: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { active: true, unit: 'item', stock: 0 },
  })

  const onSubmit = async (data: FormData) => {
    setLoading(true)
    try {
      const vendorData = await getMyVendorProfile(token)
      const vendor = vendorData?.docs?.[0]
      if (!vendor) throw new Error('Vendor profile not found. Please set up your store first.')
      await createProduct({ ...data, vendor: vendor.id }, token)
      toast.success('Product created!')
      router.push('/dashboard/products')
    } catch (err: any) {
      toast.error(err.message || 'Failed to create product')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-8 max-w-2xl">
      <div className="mb-8">
        <Link href="/dashboard/products" className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-4">
          <ArrowLeft className="w-4 h-4" /> Back to products
        </Link>
        <h2 className="text-2xl font-bold text-gray-900">Add New Product</h2>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Product Name *</label>
            <input {...register('name')} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500" placeholder="e.g. Fresh Tomatoes" />
            {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea {...register('description')} rows={3} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none" placeholder="Describe your product..." />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Price (FJD) *</label>
              <input {...register('price')} type="number" step="0.01" className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500" placeholder="0.00" />
              {errors.price && <p className="mt-1 text-sm text-red-600">{errors.price.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
              <select {...register('category')} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white">
                <option value="">Select category</option>
                {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
              {errors.category && <p className="mt-1 text-sm text-red-600">{errors.category.message}</p>}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Stock</label>
              <input {...register('stock')} type="number" className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500" placeholder="0" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
              <select {...register('unit')} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white">
                {UNITS.map(u => <option key={u.value} value={u.value}>{u.label}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">SKU (optional)</label>
            <input {...register('sku')} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500" placeholder="e.g. VEG-001" />
          </div>
          <div className="flex items-center gap-3">
            <input {...register('active')} type="checkbox" id="active" className="w-4 h-4 accent-brand-600" />
            <label htmlFor="active" className="text-sm font-medium text-gray-700">List product as active (visible to customers)</label>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={loading} className="flex-1 bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white font-semibold py-2.5 px-4 rounded-lg transition-colors">
              {loading ? 'Creating...' : 'Create Product'}
            </button>
            <Link href="/dashboard/products" className="px-6 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium text-center transition-colors">
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}
