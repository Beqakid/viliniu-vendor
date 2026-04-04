import { cookies } from 'next/headers'
import StoreClient from './StoreClient'

export const runtime = 'edge'

export default async function StoreSettingsPage() {
  const cookieStore = await cookies()
  const token = cookieStore.get('payload-token')?.value || ''

  return <StoreClient token={token} />
}
