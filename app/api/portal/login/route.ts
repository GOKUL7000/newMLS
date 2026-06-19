import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { SignJWT } from 'jose';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

const JWT_SECRET = new TextEncoder().encode(
  process.env.PORTAL_JWT_SECRET || 'mls-transports-portal-secret-change-in-production'
);
const COOKIE_NAME = 'mls_portal_session';

export async function POST(req: NextRequest) {
  try {
    const { username, password } = await req.json();

    if (!username?.trim() || !password) {
      return NextResponse.json({ error: 'Username and password are required' }, { status: 400 });
    }

    // Look up portal user
    const { data: portalUser, error } = await supabaseAdmin
      .from('portal_users')
      .select('id, username, password_hash, role, entity_id, is_active')
      .eq('username', username.trim().toLowerCase())
      .single();

    if (error || !portalUser) {
      return NextResponse.json({ error: 'Invalid username or password' }, { status: 401 });
    }

    if (!portalUser.is_active) {
      return NextResponse.json({ error: 'Your account has been deactivated. Contact your manager.' }, { status: 403 });
    }

    // Verify password
    const passwordMatch = await bcrypt.compare(password, portalUser.password_hash);
    if (!passwordMatch) {
      return NextResponse.json({ error: 'Invalid username or password' }, { status: 401 });
    }

    // Fetch entity name for display
    const entityTable = portalUser.role === 'customer'
      ? 'customers' : portalUser.role === 'driver'
      ? 'drivers' : 'suppliers';

    const { data: entity } = await supabaseAdmin
      .from(entityTable)
      .select('name')
      .eq('id', portalUser.entity_id)
      .single();

    // Update last login
    await supabaseAdmin
      .from('portal_users')
      .update({ last_login_at: new Date().toISOString() })
      .eq('id', portalUser.id);

    // Sign JWT
    const token = await new SignJWT({
      portalUserId: portalUser.id,
      role: portalUser.role,
      entityId: portalUser.entity_id,
      username: portalUser.username,
      name: entity?.name || portalUser.username,
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('7d')
      .sign(JWT_SECRET);

    // Set httpOnly cookie
    const res = NextResponse.json({
      success: true,
      role: portalUser.role,
      name: entity?.name || portalUser.username,
      redirectTo: `/portal/${portalUser.role}`,
    });

    res.cookies.set(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });

    return res;
  } catch (err: any) {
    console.error('Portal login error:', err);
    return NextResponse.json({ error: 'Login failed. Please try again.' }, { status: 500 });
  }
}
