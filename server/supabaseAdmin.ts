import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '';
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE || '';

if (!SUPABASE_URL) {
  throw new Error('SUPABASE_URL (or VITE_SUPABASE_URL) is required');
}
if (!SERVICE_ROLE_KEY) {
  throw new Error('SUPABASE_SERVICE_ROLE is required');
}

export const supabaseAdmin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

export async function assertAdminFromBearer(authHeader?: string) {
  console.log('[admin-auth] Checking auth header:', authHeader ? 'Present' : 'Missing');

  if (!authHeader || !authHeader.toLowerCase().startsWith('bearer ')) {
    console.log('[admin-auth] Missing or invalid bearer token');
    return { ok: false, status: 401, message: 'Missing Authorization bearer token' } as const;
  }
  
  const token = authHeader.slice(7);
  console.log('[admin-auth] Verifying token');
  
  const { data, error } = await supabaseAdmin.auth.getUser(token);
  if (error) {
    console.log('[admin-auth] Token verification error:', error);
    return { ok: false, status: 401, message: 'Invalid token' } as const;
  }
  
  if (!data?.user) {
    console.log('[admin-auth] No user data returned');
    return { ok: false, status: 401, message: 'Invalid token' } as const;
  }
  
  console.log('[admin-auth] Token valid for user:', {
    id: data.user.id,
    email: data.user.email,
    metadata: {
      user: data.user.user_metadata,
      app: data.user.app_metadata
    }
  });

  // 1) Prefer role from auth metadata
  const metaRoleRaw = (data.user.user_metadata as any)?.role || (data.user.app_metadata as any)?.role;
  const metaRole = typeof metaRoleRaw === 'string' ? metaRoleRaw.toLowerCase() : metaRoleRaw;
  console.log('[admin-auth] Metadata role check:', { metaRoleRaw, metaRole });
  
  if (metaRole === 'admin') {
    console.log('[admin-auth] Admin access granted via metadata');
    return { ok: true, user: data.user } as const;
  }

  // 2) Fallback: check public.users table by email
  const email = data.user.email;
  if (email) {
    console.log('[admin-auth] Checking users table for email:', email);
    
    // Try ilike first (case-insensitive exact match), then eq as fallback
    let rowRole: string | undefined;
    let userErr: any | null = null;
    try {
      const { data: row, error } = await supabaseAdmin
        .from('users')
        .select('role')
        .ilike('email', email)
        .maybeSingle();
      userErr = error;
      rowRole = (row as any)?.role ? String((row as any).role).toLowerCase() : undefined;
      console.log('[admin-auth] Users table query (ilike):', { row, error: userErr, rowRole });
    } catch (e) {
      userErr = e;
      console.log('[admin-auth] Users table query error (ilike):', e);
    }
    
    if (!userErr && rowRole === 'admin') {
      console.log('[admin-auth] Admin access granted via users table (ilike)');
      return { ok: true, user: data.user } as const;
    }
    
    try {
      const { data: row2, error: err2 } = await supabaseAdmin
        .from('users')
        .select('role')
        .eq('email', email)
        .maybeSingle();
      const r2 = (row2 as any)?.role ? String((row2 as any).role).toLowerCase() : undefined;
      console.log('[admin-auth] Users table query (eq):', { row: row2, error: err2, rowRole: r2 });
      
      if (!err2 && r2 === 'admin') {
        console.log('[admin-auth] Admin access granted via users table (eq)');
        return { ok: true, user: data.user } as const;
      }
    } catch (e) {
      console.log('[admin-auth] Users table query error (eq):', e);
    }
  }

  // 3) For development: Allow any authenticated user to be admin
  if (process.env.NODE_ENV === 'development') {
    console.log('[admin-auth] Development mode: granting admin access to any authenticated user');
    return { ok: true, user: data.user } as const;
  }

  console.warn(`[admin-auth] Forbidden for user ${data.user.email || data.user.id}; metaRole=${metaRoleRaw ?? '-'}; users.role miss or not admin`);
  return { ok: false, status: 403, message: 'Forbidden' } as const;
}
