'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Truck, User, Lock, Eye, EyeOff, Loader2 } from 'lucide-react';

export default function PortalLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!username.trim() || !password) { setError('Please enter both username and password'); return; }
    setLoading(true);
    try {
      const res = await fetch('/api/portal/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Login failed. Please try again.'); setLoading(false); return; }
      router.push(data.redirectTo || '/portal');
      router.refresh();
    } catch {
      setError('Something went wrong. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-3 sm:p-4 relative overflow-hidden"
      style={{
        background: 'radial-gradient(ellipse at 60% 40%, #1a3a6b 0%, #0f1f45 40%, #080f24 100%)',
      }}>

      {/* Dot pattern overlay */}
      <div className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: 'radial-gradient(circle, #4a7fd4 1px, transparent 1px)',
          backgroundSize: '28px 28px',
        }} />

      <div className="relative w-full max-w-md z-10">
        {/* Logo + title */}
        <div className="text-center mb-6 sm:mb-8">
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-blue-600 flex items-center justify-center mx-auto mb-3 sm:mb-4 shadow-lg shadow-blue-900/50">
            <Truck size={26} className="text-white sm:w-7 sm:h-7" />
          </div>
          <h1 className="text-[19px] sm:text-[22px] font-bold text-white tracking-wide">MLS Transports</h1>
          <p className="text-blue-300 text-[12px] sm:text-[13px] mt-1">Partner Portal</p>
        </div>

        {/* Card */}
        <div className="rounded-2xl p-5 sm:p-8 shadow-2xl"
          style={{ background: 'rgba(15, 30, 70, 0.85)', border: '1px solid rgba(255,255,255,0.08)', backdropFilter: 'blur(12px)' }}>
          <h2 className="text-[17px] sm:text-[18px] font-bold text-white mb-1">Sign in</h2>
          <p className="text-[12px] sm:text-[13px] text-blue-300 mb-5 sm:mb-6">Use the credentials provided by MLS Transports</p>

          {error && (
            <div className="mb-4 px-3 py-2.5 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-[12px]">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-[11px] font-semibold text-blue-300 tracking-widest uppercase block mb-2">Username</label>
              <div className="relative">
                <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-blue-400" />
                <input
                  type="text"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  placeholder="Enter your username"
                  autoComplete="username"
                  className="w-full pl-10 pr-4 py-3 rounded-xl text-[13px] text-white placeholder-blue-400/60 outline-none transition-all"
                  style={{
                    background: 'rgba(255,255,255,0.06)',
                    border: '1px solid rgba(255,255,255,0.12)',
                  }}
                  onFocus={e => { e.target.style.border = '1px solid rgba(96,165,250,0.6)'; e.target.style.background = 'rgba(255,255,255,0.09)'; }}
                  onBlur={e => { e.target.style.border = '1px solid rgba(255,255,255,0.12)'; e.target.style.background = 'rgba(255,255,255,0.06)'; }}
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] font-semibold text-blue-300 tracking-widest uppercase block mb-2">Password</label>
              <div className="relative">
                <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-blue-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  className="w-full pl-10 pr-11 py-3 rounded-xl text-[13px] text-white placeholder-blue-400/60 outline-none transition-all"
                  style={{
                    background: 'rgba(255,255,255,0.06)',
                    border: '1px solid rgba(255,255,255,0.12)',
                  }}
                  onFocus={e => { e.target.style.border = '1px solid rgba(96,165,250,0.6)'; e.target.style.background = 'rgba(255,255,255,0.09)'; }}
                  onBlur={e => { e.target.style.border = '1px solid rgba(255,255,255,0.12)'; e.target.style.background = 'rgba(255,255,255,0.06)'; }}
                />
                <button type="button" onClick={() => setShowPassword(s => !s)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-blue-400 hover:text-blue-300 transition-colors">
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading}
              className="w-full py-3 rounded-xl text-[14px] font-semibold text-white transition-all mt-2 flex items-center justify-center gap-2 disabled:opacity-60"
              style={{ background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)', boxShadow: '0 4px 15px rgba(37,99,235,0.4)' }}>
              {loading && <Loader2 size={15} className="animate-spin" />}
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>
        </div>

        <p className="text-center text-[11px] sm:text-[12px] text-blue-400 mt-4 sm:mt-5 px-2">
          Contact MLS Transports if you need your login credentials.
        </p>
      </div>
    </div>
  );
}