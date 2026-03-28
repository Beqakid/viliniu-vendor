'use server'

import { cookies } from 'next/headers'
import { loginVendor } from './api'

export async function loginAction(email: string, password: string) {
  try {
    const data = await loginVendor(email, password)
    
    if (data.user.role !== 'vendor' && data.user.role !== 'admin') {
      throw new Error('Access denied. Vendor account required.')
    }

    const cookieStore = await cookies()
    cookieStore.set('payload-token', data.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    })

    return { success: true, user: data.user }
  } catch (err: any) {
    return { success: false, error: err.message }
  }
}

export async function logoutAction() {
  const cookieStore = await cookies()
  cookieStore.delete('payload-token')
}

export async function getTokenAction(): Promise<string | null> {
  const cookieStore = await cookies()
  return cookieStore.get('payload-token')?.value ?? null
}
