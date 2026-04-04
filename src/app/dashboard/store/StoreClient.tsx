'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { getMyVendorProfile, createVendorProfile, updateVendorProfile, getMe } from '@/lib/api'

const FIJI_CITIES = [
  { label: 'Suva', value: 'suva' },
  { label: 'Nadi', value: 'nadi' },
  { label: 'Lautoka', value: 'lautoka' },
  { label: 'Labasa', value: 'labasa' },
  { label: 'Savusavu', value: 'savusavu' },
  { label: 'Sigatoka', value: 'sigatoka' },
  { label: 'Ba', value: 'ba' },
  { label: 'Tavua', value: 'tavua' },
  { label: 'Rakiraki', value: 'rakiraki' },
  { label: 'Korovou', value: 'korovou' },
  { label: 'Navua', value: 'navua' },
  { label: 'Levuka', value: 'levuka' },
]

const schema = z.object({
  storeName: z.string().min(2, 'Store name must be at least 2 characters'),
  location: z.string().min(1, 'Please select a location'),
  address: z.string().min(1, 'Please enter your store address'),
  phone: z.string().optional(),
  deliveryType: z.enum(['own_delivery', 'platform_delivery']),
  payoutDetails: z.string().optional(),
})

type FormData = z.infer<typeof schema>

export default function StoreClient({ token }: { token: string }) {
  const [loading, setLoading] = useState(false)
  const [vendor, setVendor] = useState<any>(null)
  const [fetching, setFetching] = useState(true)

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { deliveryType: 'own_delivery' },
  })

  useEffect(() => {
    const load = async () => {
      if (!token) { setFetching(false); return }
      try {
        const data = await getMyVendorProfile(token)
        if (data?.docs?.[0]) {
          const v = data.docs[0]
          setVendor(v)
          reset({
            storeName: v.storeName,
            location: v.location,
            address: v.address ?? '',
            phone: v.phone ?? '',
            deliveryType: v.deliveryType,
            payoutDetails: v.payoutDetails ?? '',
          })
        }
      } catch {}
      finally { setFetching(false) }
    }
    load()
  }, [token, reset])

  const onSubmit = async (data: FormData) => {
    setLoading(true)
    try {
      if (!token) throw new Error('Not authenticated')
      const meData = await getMe(token)
      if (vendor) {
        await updateVendorProfile(vendor.id, data, token)
        toast.success('Store updated!')
      } else {
        await createVendorProfile({ ...data, user: meData.user.id }, token)
        toast.success('Store created! Awaiting admin approval.')
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to save store')
    } finally {
      setLoading(false)
    }
  }

  if (fetching) return <div className="p-8 text-gray-500">Loading...</div>

  return (
    <div className="p-8 max-w-2xl">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900">Store Settings</h2>
        <p className="text-gray-500 text-sm mt-1">{vendor ? 'Update your store details' : 'Set up your store to start selling'}</p>
      </div>

      {vendor && !vendor.approved && (
        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-800">Your store is pending admin approval.</p>
        </div>
      )}
      {vendor?.approved && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-sm text-green-800">Your store is live and approved!</p>
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Store Name *</label>
            <input {...register('storeName')} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500" placeholder="e.g. Fresh Fiji Groceries" />
            {errors.storeName && <p className="mt-1 text-sm text-red-600">{errors.storeName.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Location *</label>
            <select {...register('location')} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white">
              <option value="">Select your city in Fiji</option>
              {FIJI_CITIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
            {errors.location && <p className="mt-1 text-sm text-red-600">{errors.location.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Store Address *</label>
            <input {...register('address')} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500" placeholder="e.g. 123 Victoria Parade, Suva" />
            <p className="mt-1 text-xs text-gray-400">Delivery drivers use this for order pickup</p>
            {errors.address && <p className="mt-1 text-sm text-red-600">{errors.address.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Store Phone</label>
            <input {...register('phone')} type="tel" className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500" placeholder="e.g. +679 330 1234" />
            <p className="mt-1 text-xs text-gray-400">Drivers can call if they need pickup directions</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Type *</label>
            <div className="space-y-2">
              <label className="flex items-start gap-3 p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                <input {...register('deliveryType')} type="radio" value="own_delivery" className="mt-0.5 accent-brand-600" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Own Delivery</p>
                  <p className="text-xs text-gray-500">You handle deliveries using your own drivers</p>
                </div>
              </label>
              <label className="flex items-start gap-3 p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                <input {...register('deliveryType')} type="radio" value="platform_delivery" className="mt-0.5 accent-brand-600" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Platform Delivery</p>
                  <p className="text-xs text-gray-500">Viliniu assigns a delivery driver for your orders</p>
                </div>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Payout Details</label>
            <textarea {...register('payoutDetails')} rows={3} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none" placeholder="Bank account details or mobile money for payouts..." />
          </div>

          <button type="submit" disabled={loading} className="w-full bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white font-semibold py-2.5 px-4 rounded-lg transition-colors">
            {loading ? 'Saving...' : vendor ? 'Update Store' : 'Create Store'}
          </button>
        </form>
      </div>
    </div>
  )
}
