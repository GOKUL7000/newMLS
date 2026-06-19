// lib/portalSession.ts
// Use this in portal pages to get the current session via API

export type PortalSession = {
  portalUserId: string;
  role: 'customer' | 'driver' | 'supplier';
  entityId: string;
  username: string;
  name: string;
};

// Call this from portal page useEffect to get session data
export async function getPortalSession(): Promise<PortalSession | null> {
  try {
    const res = await fetch('/api/portal/session');
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export async function portalLogout() {
  await fetch('/api/portal/logout', { method: 'POST' });
  window.location.href = '/portal/login';
}