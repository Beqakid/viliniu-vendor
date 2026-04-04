// src/app/dashboard/team/page.tsx
import { cookies } from 'next/headers'
import { getMyVendorProfile, getMyStaffRole, getStoreStaff } from '@/lib/api'
import TeamClient from './TeamClient'

export const runtime = 'edge'

export default async function TeamPage() {
  const cookieStore = await cookies()
  const token = cookieStore.get('payload-token')?.value!

  let vendorId: number | null = null
  let myRole = 'store_owner'

  // Try to get vendor profile (for store owners)
  const vendorData = await getMyVendorProfile(token).catch(() => null)
  if (vendorData?.docs?.[0]) {
    vendorId = vendorData.docs[0].id
  }

  // If not a direct vendor owner, check staff role
  if (!vendorId) {
    const roleData = await getMyStaffRole(token).catch(() => null)
    if (roleData) {
      vendorId = roleData.vendorId
      myRole = roleData.role
    }
  }

  if (!vendorId) {
    return (
      <div className="p-8">
        <p className="text-gray-500">No store found. You need to be part of a store to manage a team.</p>
      </div>
    )
  }

  const staffData = await getStoreStaff(vendorId, token).catch(() => null)

  return (
    <TeamClient
      token={token}
      vendorId={vendorId}
      myRole={myRole}
      storeName={staffData?.storeName || ''}
      initialStaff={staffData?.staff || []}
    />
  )
}
