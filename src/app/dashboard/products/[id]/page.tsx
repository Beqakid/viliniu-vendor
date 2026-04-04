import { cookies } from 'next/headers'
import EditProductClient from './EditProductClient'

export const runtime = 'edge'

export default async function EditProductPage({ params }: any) {
  const cookieStore = await cookies()
  const token = cookieStore.get('payload-token')?.value || ''
  const { id } = await params
  return <EditProductClient token={token} productId={id} />
}
