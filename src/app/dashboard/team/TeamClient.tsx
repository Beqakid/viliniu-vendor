'use client'

import { useState } from 'react'
import { Users, UserPlus, Shield, Truck, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { getStoreStaff, inviteStaff, removeStaff } from '@/lib/api'
import { toast } from 'sonner'

interface StaffMember {
  id: number | string
  user: { id: number; name: string; email: string }
  role: string
  active: boolean
  isOwner: boolean
  createdAt?: string
}

interface TeamClientProps {
  token: string
  vendorId: number
  myRole: string
  storeName: string
  initialStaff: StaffMember[]
}

const ROLE_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  store_owner: { label: 'Store Owner', color: 'text-purple-700', bg: 'bg-purple-100' },
  store_manager: { label: 'Store Manager', color: 'text-blue-700', bg: 'bg-blue-100' },
  store_staff: { label: 'Store Staff', color: 'text-green-700', bg: 'bg-green-100' },
  delivery_driver: { label: 'Delivery Driver', color: 'text-orange-700', bg: 'bg-orange-100' },
}

function RoleBadge({ role }: { role: string }) {
  const config = ROLE_CONFIG[role] || { label: role, color: 'text-gray-700', bg: 'bg-gray-100' }
  return (
    <span className={cn('inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium', config.bg, config.color)}>
      {role === 'store_owner' && <Shield className="h-3 w-3" />}
      {role === 'delivery_driver' && <Truck className="h-3 w-3" />}
      {config.label}
    </span>
  )
}

function StatusBadge({ active }: { active: boolean }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
        active ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'
      )}
    >
      <span className={cn('mr-1.5 h-1.5 w-1.5 rounded-full', active ? 'bg-green-500' : 'bg-gray-400')} />
      {active ? 'Active' : 'Inactive'}
    </span>
  )
}

export default function TeamClient({ token, vendorId, myRole, storeName, initialStaff }: TeamClientProps) {
  const [staff, setStaff] = useState<StaffMember[]>(initialStaff)
  const [loading, setLoading] = useState(false)
  const [showInviteForm, setShowInviteForm] = useState(false)
  const [showAddForm, setShowAddForm] = useState(false)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteName, setInviteName] = useState('')
  const [inviteRole, setInviteRole] = useState('store_staff')
  const [inviting, setInviting] = useState(false)
  const [addEmail, setAddEmail] = useState('')
  const [addName, setAddName] = useState('')
  const [addPassword, setAddPassword] = useState('')
  const [addRole, setAddRole] = useState('store_staff')
  const [adding, setAdding] = useState(false)
  const [removingId, setRemovingId] = useState<number | string | null>(null)

  const canManageTeam = myRole === 'store_owner' || myRole === 'store_manager'

  const availableRoles =
    myRole === 'store_owner'
      ? [
          { value: 'store_manager', label: 'Store Manager' },
          { value: 'store_staff', label: 'Store Staff' },
          { value: 'delivery_driver', label: 'Delivery Driver' },
        ]
      : [
          { value: 'store_staff', label: 'Store Staff' },
          { value: 'delivery_driver', label: 'Delivery Driver' },
        ]

  async function refreshStaff() {
    try {
      setLoading(true)
      const data = await getStoreStaff(vendorId, token)
      setStaff(data.staff || [])
    } catch (err: any) {
      toast.error('Failed to refresh team list')
    } finally {
      setLoading(false)
    }
  }

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault()

    if (!inviteEmail.trim() || !inviteName.trim()) {
      toast.error('Please fill in all fields')
      return
    }

    try {
      setInviting(true)
      const result = await inviteStaff(
        { email: inviteEmail.trim(), name: inviteName.trim(), role: inviteRole, vendorId },
        token
      )
      toast.success(result.message || 'Staff member invited successfully')
      setInviteEmail('')
      setInviteName('')
      setInviteRole('store_staff')
      setShowInviteForm(false)
      await refreshStaff()
    } catch (err: any) {
      toast.error(err.message || 'Failed to invite staff member')
    } finally {
      setInviting(false)
    }
  }

  async function handleAddMember(e: React.FormEvent) {
    e.preventDefault()

    if (!addEmail.trim() || !addName.trim() || !addPassword.trim()) {
      toast.error('Please fill in all fields')
      return
    }

    if (addPassword.length < 6) {
      toast.error('Password must be at least 6 characters')
      return
    }

    try {
      setAdding(true)
      const res = await fetch(`${process.env.NEXT_PUBLIC_PAYLOAD_URL}/api/vendor-staff/add-member`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `JWT ${token}` },
        body: JSON.stringify({
          email: addEmail.trim(),
          name: addName.trim(),
          password: addPassword,
          role: addRole,
          vendorId,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to add member')
      }

      toast.success(data.message || 'Member added successfully')
      setAddEmail('')
      setAddName('')
      setAddPassword('')
      setAddRole('store_staff')
      setShowAddForm(false)
      await refreshStaff()
    } catch (err: any) {
      toast.error(err.message || 'Failed to add member')
    } finally {
      setAdding(false)
    }
  }

  async function handleRemove(member: StaffMember) {
    if (member.isOwner || member.role === 'store_owner') return

    if (myRole === 'store_manager' && member.role === 'store_manager') {
      toast.error('Managers cannot remove other managers')
      return
    }

    const displayName = member.user?.name || member.user?.email || 'this member'
    if (!confirm(`Remove ${displayName} from the team?`)) return

    try {
      setRemovingId(member.id)
      const result = await removeStaff(member.id as number, token)
      toast.success(result.message || 'Staff member removed')
      await refreshStaff()
    } catch (err: any) {
      toast.error(err.message || 'Failed to remove staff member')
    } finally {
      setRemovingId(null)
    }
  }

  function openInviteForm() {
    setShowAddForm(false)
    setShowInviteForm(true)
  }

  function openAddForm() {
    setShowInviteForm(false)
    setShowAddForm(true)
  }

  return (
    <div className="space-y-6 p-4 md:p-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Team</h1>
          {storeName && <p className="mt-1 text-sm text-gray-500">{storeName}</p>}
        </div>
        {canManageTeam && (
          <div className="flex gap-2">
            <button
              onClick={openInviteForm}
              className={cn(
                'inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors',
                showInviteForm
                  ? 'bg-brand-700 ring-2 ring-brand-300'
                  : 'bg-brand-600 hover:bg-brand-700'
              )}
            >
              <UserPlus className="h-4 w-4" />
              Invite Member
            </button>
            <button
              onClick={openAddForm}
              className={cn(
                'inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors',
                showAddForm
                  ? 'bg-green-700 ring-2 ring-green-300'
                  : 'bg-green-600 hover:bg-green-700'
              )}
            >
              <UserPlus className="h-4 w-4" />
              Add Member
            </button>
          </div>
        )}
      </div>

      {/* Invite Form */}
      {showInviteForm && canManageTeam && (
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">Invite Team Member</h2>
          <form onSubmit={handleInvite} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="invite-name" className="mb-1 block text-sm font-medium text-gray-700">
                  Name
                </label>
                <input
                  id="invite-name"
                  type="text"
                  value={inviteName}
                  onChange={(e) => setInviteName(e.target.value)}
                  placeholder="Full name"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-brand-600 focus:outline-none focus:ring-1 focus:ring-brand-600"
                  required
                />
              </div>
              <div>
                <label htmlFor="invite-email" className="mb-1 block text-sm font-medium text-gray-700">
                  Email
                </label>
                <input
                  id="invite-email"
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="email@example.com"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-brand-600 focus:outline-none focus:ring-1 focus:ring-brand-600"
                  required
                />
              </div>
            </div>
            <div>
              <label htmlFor="invite-role" className="mb-1 block text-sm font-medium text-gray-700">
                Role
              </label>
              <select
                id="invite-role"
                value={inviteRole}
                onChange={(e) => setInviteRole(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-brand-600 focus:outline-none focus:ring-1 focus:ring-brand-600"
              >
                {availableRoles.map((r) => (
                  <option key={r.value} value={r.value}>
                    {r.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={inviting}
                className="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-700 disabled:opacity-50"
              >
                {inviting ? 'Inviting…' : 'Send Invite'}
              </button>
              <button
                type="button"
                onClick={() => setShowInviteForm(false)}
                className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Add Member Form */}
      {showAddForm && canManageTeam && (
        <div className="rounded-lg border border-green-200 bg-white p-6 shadow-sm">
          <h2 className="mb-1 text-lg font-semibold text-gray-900">Add Team Member</h2>
          <p className="mb-4 text-sm text-gray-500">
            Create a team member account directly. Share the login credentials with them.
          </p>
          <form onSubmit={handleAddMember} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="add-name" className="mb-1 block text-sm font-medium text-gray-700">
                  Name
                </label>
                <input
                  id="add-name"
                  type="text"
                  value={addName}
                  onChange={(e) => setAddName(e.target.value)}
                  placeholder="Full name"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-green-600 focus:outline-none focus:ring-1 focus:ring-green-600"
                  required
                />
              </div>
              <div>
                <label htmlFor="add-email" className="mb-1 block text-sm font-medium text-gray-700">
                  Email
                </label>
                <input
                  id="add-email"
                  type="email"
                  value={addEmail}
                  onChange={(e) => setAddEmail(e.target.value)}
                  placeholder="email@example.com"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-green-600 focus:outline-none focus:ring-1 focus:ring-green-600"
                  required
                />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="add-password" className="mb-1 block text-sm font-medium text-gray-700">
                  Password
                </label>
                <input
                  id="add-password"
                  type="password"
                  value={addPassword}
                  onChange={(e) => setAddPassword(e.target.value)}
                  placeholder="Min 6 characters"
                  minLength={6}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-green-600 focus:outline-none focus:ring-1 focus:ring-green-600"
                  required
                />
              </div>
              <div>
                <label htmlFor="add-role" className="mb-1 block text-sm font-medium text-gray-700">
                  Role
                </label>
                <select
                  id="add-role"
                  value={addRole}
                  onChange={(e) => setAddRole(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-green-600 focus:outline-none focus:ring-1 focus:ring-green-600"
                >
                  {availableRoles.map((r) => (
                    <option key={r.value} value={r.value}>
                      {r.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={adding}
                className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-green-700 disabled:opacity-50"
              >
                {adding ? 'Adding…' : 'Add Member'}
              </button>
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Staff List */}
      <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-200 px-6 py-4">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-gray-400" />
            <h2 className="text-lg font-semibold text-gray-900">Team Members</h2>
            <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">
              {staff.length}
            </span>
          </div>
        </div>

        {loading && staff.length === 0 ? (
          <div className="px-6 py-12 text-center text-sm text-gray-500">Loading team…</div>
        ) : staff.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <Users className="mx-auto h-10 w-10 text-gray-300" />
            <p className="mt-2 text-sm text-gray-500">No team members yet. Invite your first staff member!</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {staff.map((member) => {
              const name = member.user?.name || ''
              const email = member.user?.email || ''
              const initial = (name || email || '?').charAt(0).toUpperCase()

              return (
                <div
                  key={member.id}
                  className="flex items-center justify-between px-6 py-4 transition-colors hover:bg-gray-50"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-sm font-semibold text-gray-600">
                      {initial}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{name || 'Unnamed'}</p>
                      <p className="text-xs text-gray-500">{email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <RoleBadge role={member.role} />
                    <StatusBadge active={member.active} />
                    {canManageTeam && !member.isOwner && member.role !== 'store_owner' && (
                      <>
                        {!(myRole === 'store_manager' && member.role === 'store_manager') && (
                          <button
                            onClick={() => handleRemove(member)}
                            disabled={removingId === member.id}
                            className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-500 disabled:opacity-50"
                            title="Remove member"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
