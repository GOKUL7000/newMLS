'use client';

import { useState } from 'react';
import { Eye, EyeOff, Shield, ShieldOff, Key, User, Loader2, CheckCircle2 } from 'lucide-react';

interface PortalUserFieldProps {
  role: 'customer' | 'driver' | 'supplier';
  entityId: string | null;       // null when creating new entity
  hasPortalAccess: boolean;
  onSuccess?: () => void;        // called after grant/revoke so parent can refetch
  // Toast handler from parent
  toast: (type: 'success' | 'error', message: string) => void;
}

const inputCls = "w-full border border-gray-200 rounded-lg px-3 py-1.5 text-[12px] focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100";

export default function PortalUserField({
  role, entityId, hasPortalAccess, onSuccess, toast,
}: PortalUserFieldProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [saving, setSaving] = useState(false);

  // For new entity (entityId is null), just expose the values via a ref-like pattern
  // Parent will collect username/password during their own save via getPortalCredentials()

  async function handleGrant() {
    if (!entityId) {
      toast('error', 'Save the record first, then set portal credentials.');
      return;
    }
    if (!username.trim() || !password) {
      toast('error', 'Username and password are required');
      return;
    }
    setSaving(true);
    try {
      const res = await fetch('/api/portal/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password, role, entityId }),
      });
      const data = await res.json();
      if (!res.ok) { toast('error', data.error || 'Failed to create portal access'); return; }
      toast('success', `Portal access ${data.action === 'created' ? 'created' : 'updated'} for @${username}`);
      setUsername('');
      setPassword('');
      onSuccess?.();
    } catch {
      toast('error', 'Network error');
    } finally {
      setSaving(false);
    }
  }

  async function handleRevoke() {
    if (!entityId) return;
    setSaving(true);
    try {
      const res = await fetch('/api/portal/register', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ entityId, role }),
      });
      const data = await res.json();
      if (!res.ok) { toast('error', data.error || 'Failed to revoke'); return; }
      toast('success', 'Portal access revoked');
      onSuccess?.();
    } catch {
      toast('error', 'Network error');
    } finally {
      setSaving(false);
    }
  }

  const roleLabel = role.charAt(0).toUpperCase() + role.slice(1);

  return (
    <div className="col-span-2 border border-blue-100 rounded-lg p-3 bg-blue-50/40 space-y-2.5">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Shield size={13} className="text-blue-600" />
        <span className="text-[12px] font-semibold text-blue-800">{roleLabel} Portal Access</span>
        {hasPortalAccess && (
          <span className="ml-auto flex items-center gap-1 text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">
            <CheckCircle2 size={10} /> Active
          </span>
        )}
      </div>

      {/* New entity hint */}
      {!entityId && (
        <p className="text-[11px] text-amber-600 bg-amber-50 border border-amber-200 rounded px-2 py-1">
          Save the record first, then open Edit to set portal credentials.
        </p>
      )}

      {/* Credentials form */}
      {entityId && (
        <>
          {hasPortalAccess ? (
            <p className="text-[11px] text-gray-500">
              Portal access is active. Enter new credentials below to reset password.
            </p>
          ) : (
            <p className="text-[11px] text-gray-500">
              Set a username and password to give this {role} portal login access.
            </p>
          )}

          <div className="grid grid-cols-2 gap-2">
            {/* Username */}
            <div className="relative">
              <User size={11} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value.toLowerCase().replace(/\s/g, ''))}
                placeholder="Username"
                className={`${inputCls} pl-7`}
                autoComplete="off"
              />
            </div>

            {/* Password */}
            <div className="relative">
              <Key size={11} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type={showPwd ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Password"
                className={`${inputCls} pl-7 pr-7`}
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowPwd(v => !v)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPwd ? <EyeOff size={11} /> : <Eye size={11} />}
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleGrant}
              disabled={saving || !username.trim() || !password}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-[11px] font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {saving
                ? <Loader2 size={10} className="animate-spin" />
                : <Shield size={10} />}
              {hasPortalAccess ? 'Reset Credentials' : 'Grant Portal Access'}
            </button>

            {hasPortalAccess && (
              <button
                type="button"
                onClick={handleRevoke}
                disabled={saving}
                className="flex items-center gap-1.5 px-3 py-1.5 border border-red-200 text-red-600 rounded-lg text-[11px] font-medium hover:bg-red-50 disabled:opacity-50 transition-colors"
              >
                <ShieldOff size={10} /> Revoke Access
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
}
