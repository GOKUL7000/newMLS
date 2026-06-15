'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Truck, Eye, EyeOff, Lock, Mail, AlertCircle } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const { error: authError } = await supabase.auth.signInWithPassword({ email, password })
      if (authError) throw authError
      router.push('/dashboard')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Login failed. Please check your credentials.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f1f5c] via-[#1a3a8f] to-[#1a56db] flex items-center justify-center p-4">
      {/* Background pattern */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="absolute rounded-full opacity-5 bg-white"
            style={{ width: `${(i+1)*120}px`, height: `${(i+1)*120}px`, top: `${10+i*8}%`, left: `${5+i*12}%` }} />
        ))}
      </div>

      <div className="w-full max-w-md relative">
        {/* Card */}
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Top bar */}
          <div className="bg-gradient-to-r from-[#1a56db] to-[#1e429f] px-8 py-6 text-white">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                <Truck size={22} className="text-white" />
              </div>
              <div>
                <div className="text-lg font-extrabold tracking-tight">MLS TRANSPORTS</div>
                <div className="text-xs text-blue-200">Transport Management System</div>
              </div>
            </div>
            <p className="text-sm text-blue-100 mt-2">Sign in to manage your transport operations</p>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="px-8 py-7 space-y-5">
            <div>
              <label className="form-label">Email Address</label>
              <div className="relative">
                <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="admin@mlstransports.com"
                  required
                  className="form-input pl-9"
                />
              </div>
            </div>

            <div>
              <label className="form-label">Password</label>
              <div className="relative">
                <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="form-input pl-9 pr-9"
                />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs">
              <label className="flex items-center gap-2 text-gray-500 cursor-pointer">
                <input type="checkbox" className="rounded border-gray-300 text-blue-600" />
                Remember me
              </label>
              <button type="button" className="text-[#1a56db] font-medium hover:underline">
                Forgot password?
              </button>
            </div>

            {error && (
              <div className="flex items-center gap-2 bg-red-50 border border-red-100 rounded-lg px-3 py-2.5 text-xs text-red-600">
                <AlertCircle size={13} />
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#1a56db] text-white text-sm font-bold py-2.5 rounded-xl hover:bg-[#1e429f] transition disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Signing in...
                </>
              ) : 'Sign In'}
            </button>

            {/* Demo credentials hint */}
            <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 text-[11px] text-gray-500">
              <div className="font-semibold text-gray-700 mb-1">Demo Credentials</div>
              <div>Email: <span className="text-gray-700 font-medium">admin@mlstransports.com</span></div>
              <div>Password: <span className="text-gray-700 font-medium">Admin@123</span></div>
            </div>
          </form>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-blue-200 mt-4">
          © 2026 MLS Transports · No.45, Transport Nagar, Coimbatore
        </p>
      </div>
    </div>
  )
}
