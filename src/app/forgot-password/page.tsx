'use client'

import { useState } from 'react'
import Link from 'next/link'

const PAYLOAD_URL = process.env.NEXT_PUBLIC_PAYLOAD_URL || 'https://multistore.jjioji.workers.dev'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`${PAYLOAD_URL}/api/users/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      if (!res.ok) throw new Error('Something went wrong. Please try again.')
      setSubmitted(true)
    } catch (err: any) {
      setError(err.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
        <div className="max-w-md w-full">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">
              <span className="text-brand-600">Viliniu</span> Vendor
            </h1>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 text-center">
            <div className="text-4xl mb-4">📧</div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Check your email</h2>
            <p className="text-gray-600 mb-6">
              If an account exists with that email, you&apos;ll receive password reset instructions. If you don&apos;t receive an email, please contact your administrator.
            </p>
            <div className="space-y-3">
              <Link href="/reset-password" className="block text-brand-600 hover:text-brand-700 font-medium text-sm">
                Have a reset code? Reset your password
              </Link>
              <Link href="/login" className="block text-gray-500 hover:text-gray-700 text-sm">
                ← Back to sign in
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            <span className="text-brand-600">Viliniu</span> Vendor
          </h1>
          <p className="mt-2 text-gray-600">Reset your password</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="bg-red-50 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                placeholder="you@example.com"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white font-semibold py-2.5 px-4 rounded-lg transition-colors"
            >
              {loading ? 'Sending...' : 'Send reset instructions'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-600">
            <Link href="/login" className="text-brand-600 hover:text-brand-700 font-medium">
              ← Back to sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
