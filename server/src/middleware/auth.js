import { createClient } from '@supabase/supabase-js';
import { config } from '../config.js';

// Base client for auth verification
export const supabaseAdmin = createClient(
  config.supabaseUrl || 'https://placeholder.supabase.co',
  config.supabaseServiceRoleKey || 'placeholder-key',
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  }
);

export async function requireAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Missing or malformed Authorization header. Expected Bearer token.',
      });
    }

    const token = authHeader.slice(7).trim();
    if (!token) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Empty token provided.',
      });
    }

    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: error?.message || 'Invalid or expired session. Please log in again.',
      });
    }

    req.user = user;

    // Attach a user-scoped Supabase client that carries the user's JWT.
    // This guarantees that Row Level Security (RLS) works whether
    // the configured key is a service_role key or an anon key!
    req.supabase = createClient(
      config.supabaseUrl,
      config.supabaseServiceRoleKey,
      {
        global: {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      }
    );

    next();
  } catch (err) {
    console.error('Auth verification error:', err);
    return res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to authenticate user session.',
    });
  }
}
