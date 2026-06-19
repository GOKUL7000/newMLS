import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

// POST — create or update portal user
export async function POST(req: NextRequest) {
  try {
    const { username, password, role, entityId } = await req.json();

    if (!username?.trim() || !password || !role || !entityId) {
      return NextResponse.json({ error: 'username, password, role, entityId are required' }, { status: 400 });
    }

    const cleanUsername = username.trim().toLowerCase();

    // Check username not already taken by a different entity
    const { data: existing } = await supabaseAdmin
      .from('portal_users')
      .select('id, entity_id')
      .eq('username', cleanUsername)
      .single();

    if (existing && existing.entity_id !== entityId) {
      return NextResponse.json({ error: 'Username already taken. Choose a different one.' }, { status: 409 });
    }

    const password_hash = await bcrypt.hash(password, 12);

    if (existing && existing.entity_id === entityId) {
      // Update existing — reset password
      const { error } = await supabaseAdmin
        .from('portal_users')
        .update({ password_hash, is_active: true, username: cleanUsername })
        .eq('id', existing.id);

      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ success: true, action: 'updated', portalUserId: existing.id });
    }

    // Insert new portal user
    const { data: newUser, error: insertErr } = await supabaseAdmin
      .from('portal_users')
      .insert({ username: cleanUsername, password_hash, role, entity_id: entityId, is_active: true })
      .select('id')
      .single();

    if (insertErr) return NextResponse.json({ error: insertErr.message }, { status: 500 });

    // Link portal_user_id back to entity table
    const entityTable = role === 'customer' ? 'customers'
      : role === 'driver' ? 'drivers' : 'suppliers';

    await supabaseAdmin
      .from(entityTable)
      .update({ portal_user_id: newUser.id })
      .eq('id', entityId);

    return NextResponse.json({ success: true, action: 'created', portalUserId: newUser.id });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal error' }, { status: 500 });
  }
}

// DELETE — deactivate portal user
export async function DELETE(req: NextRequest) {
  try {
    const { entityId, role } = await req.json();
    if (!entityId || !role) {
      return NextResponse.json({ error: 'entityId and role required' }, { status: 400 });
    }

    const { error } = await supabaseAdmin
      .from('portal_users')
      .update({ is_active: false })
      .eq('entity_id', entityId)
      .eq('role', role);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    // Unlink from entity
    const entityTable = role === 'customer' ? 'customers'
      : role === 'driver' ? 'drivers' : 'suppliers';
    await supabaseAdmin
      .from(entityTable)
      .update({ portal_user_id: null })
      .eq('id', entityId);

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal error' }, { status: 500 });
  }
}
