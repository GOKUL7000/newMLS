import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { SignJWT } from 'jose';
import { JWT_SECRET, COOKIE_NAME } from '@/lib/portal-auth';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

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

    const sessionPayload = {
      portalUserId: portalUser.id,
      role: portalUser.role,
      entityId: portalUser.entity_id,
      username: portalUser.username,
      name: entity?.name || portalUser.username,
    };

    // Sign JWT
    const token = await new SignJWT(sessionPayload)
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('7d')
      .sign(JWT_SECRET);

    // Response includes the token directly (used by the mobile app, which
    // stores it and sends it back as an Authorization header). The web app
    // ignores this field and continues to rely on the httpOnly cookie below.
    const res = NextResponse.json({
      success: true,
      role: portalUser.role,
      name: entity?.name || portalUser.username,
      redirectTo: `/portal/${portalUser.role}`,
      token,
      session: sessionPayload,
    });

    // Set httpOnly cookie (web app auth path — unchanged)
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