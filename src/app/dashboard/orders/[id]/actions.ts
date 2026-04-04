'use server'

import { cookies } from 'next/headers'
import { updateOrderStatus } from '@/lib/api'
import { revalidatePath } from 'next/cache'

export async function updateOrderStatusAction(orderId: string, status: string) {
  const cookieStore = await cookies()
  const token = cookieStore.get('payload-token')?.value
  if (!token) {
    return { success: false, error: 'Not authenticated. Please log in again.' }
  }
  try {
    await updateOrderStatus(orderId, status, token)
    revalidatePath(`/dashboard/orders/${orderId}`)
    revalidatePath('/dashboard/orders')
    return { success: true }
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to update status' }
  }
}
