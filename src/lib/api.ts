const PAYLOAD_URL = process.env.NEXT_PUBLIC_PAYLOAD_URL || ''

async function fetchAPI<T>(
  path: string,
  options: RequestInit = {},
  token?: string,
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  }

  if (token) {
    headers['Authorization'] = `JWT ${token}`
  }

  const res = await fetch(`${PAYLOAD_URL}/api${path}`, {
    ...options,
    headers,
  })

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: 'Request failed' }))
    throw new Error(error.message || `HTTP ${res.status}`)
  }

  return res.json()
}

export async function loginVendor(email: string, password: string) {
  return fetchAPI<{ token: string; user: any }>('/users/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  })
}

export async function registerVendor(data: {
  name: string
  email: string
  password: string
  phone?: string
}) {
  return fetchAPI<{ user: any; message: string }>('/users', {
    method: 'POST',
    body: JSON.stringify({ ...data, role: 'vendor' }),
  })
}

export async function getMe(token: string) {
  return fetchAPI<{ user: any }>('/users/me', {}, token)
}

export async function getMyVendorProfile(token: string) {
  const me = await getMe(token)
  if (!me?.user?.id) {
    return { docs: [], totalDocs: 0 }
  }
  return fetchAPI<{ docs: any[]; totalDocs: number }>(
    `/vendors?where[user][equals]=${me.user.id}&limit=1`,
    {},
    token,
  )
}

export async function createVendorProfile(data: any, token: string) {
  return fetchAPI<{ doc: any }>('/vendors', {
    method: 'POST',
    body: JSON.stringify(data),
  }, token)
}

export async function updateVendorProfile(id: string, data: any, token: string) {
  return fetchAPI<{ doc: any }>(`/vendors/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  }, token)
}

export async function getVendorProducts(vendorId: string, token: string, page = 1) {
  return fetchAPI<{ docs: any[]; totalDocs: number; totalPages: number }>(
    `/products?where[vendor][equals]=${vendorId}&limit=20&page=${page}&sort=-createdAt`,
    {},
    token,
  )
}

export async function createProduct(data: any, token: string) {
  return fetchAPI<{ doc: any }>('/products', {
    method: 'POST',
    body: JSON.stringify(data),
  }, token)
}

export async function updateProduct(id: string, data: any, token: string) {
  return fetchAPI<{ doc: any }>(`/products/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  }, token)
}

export async function deleteProduct(id: string, token: string) {
  return fetchAPI<{ message: string }>(`/products/${id}`, {
    method: 'DELETE',
  }, token)
}

export async function getVendorOrders(vendorId: string, token: string, page = 1) {
  return fetchAPI<{ docs: any[]; totalDocs: number; totalPages: number }>(
    `/orders?where[vendor][equals]=${vendorId}&limit=20&page=${page}&sort=-createdAt&depth=2`,
    {},
    token,
  )
}

export async function updateOrderStatus(id: string, status: string, token: string) {
  return fetchAPI<{ doc: any }>(`/orders/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  }, token)
}

// ===== Staff Management =====

export async function getMyStaffRole(token: string) {
  return fetchAPI<{ vendorId: number; role: string; storeName: string; vendor: any }>(
    '/vendor-staff/my-role',
    {},
    token
  )
}

export async function getStoreStaff(vendorId: number, token: string) {
  return fetchAPI<{ vendorId: number; storeName: string; staff: any[] }>(
    `/vendor-staff/list/${vendorId}`,
    {},
    token
  )
}

export async function inviteStaff(
  data: { email: string; name: string; role: string; vendorId: number },
  token: string
) {
  return fetchAPI<{ success: boolean; message: string; userId: number }>(
    '/vendor-staff/invite',
    {
      method: 'POST',
      body: JSON.stringify(data),
    },
    token
  )
}

export async function removeStaff(staffId: number, token: string) {
  return fetchAPI<{ success: boolean; message: string }>(
    `/vendor-staff/remove/${staffId}`,
    {
      method: 'POST',
    },
    token
  )
}

export async function updateStaffMember(
  data: { staffId: number | string; vendorId: number; name?: string; phone?: string; role?: string; password?: string },
  token: string
) {
  return fetchAPI<{ success: boolean; message: string }>(
    '/team/update-member',
    {
      method: 'POST',
      body: JSON.stringify(data),
    },
    token
  )
}
