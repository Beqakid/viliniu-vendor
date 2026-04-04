import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import NewProductClient from './NewProductClient'

export default async function NewProductPage() {
  const cookieStore = await cookies()
  const token = cookieStore.get('payload-token')?.value
  if (!token) redirect('/login')
  return <NewProductClient token={token} />
}
