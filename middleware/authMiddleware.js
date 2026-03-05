const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Use Service Role if available, otherwise fallback to the Anon key for token validation
const supabaseClient =
  supabaseUrl && (serviceRoleKey || supabaseKey)
    ? createClient(supabaseUrl, serviceRoleKey || supabaseKey)
    : null;

/**
 * Auth middleware
 * - Validates the incoming JWT Bearer token and attaches req.userId.
 * - If no valid token is found, falls back to userId provided by the client's body/params.
 */
async function authMiddleware(req, res, next) {
  try {
    let userId = null;

    if (supabaseClient) {
      const authHeader = req.headers.authorization || '';
      const [, token] = authHeader.split(' ');

      if (token) {
        // Validate token
        const {
          data: { user },
          error,
        } = await supabaseClient.auth.getUser(token);

        if (error) {
          console.error('[authMiddleware] Supabase getUser error:', error.message);
          return res.status(401).json({ error: 'Invalid or expired token' });
        } else if (user) {
          userId = user.id;
          console.log('[authMiddleware] Token Valid! UserId:', userId);
        }
      } else {
        console.log('[authMiddleware] No token found in header');
        // If they provided a userId in the body WITHOUT a token, this is an attempted impersonation attack
        if (req.body?.userId || req.query?.userId) {
          console.error('[SECURITY] Blocked unauthenticated attempt to assert userId');
          return res.status(401).json({ error: 'Unauthorized: Missing Auth Token' });
        }
      }
    } else {
      console.error('[authMiddleware] Security Critical: No supabase client configured!');
      return res.status(500).json({ error: 'Internal Server Configuration Error' });
    }

    req.userId = userId || null;
    next();
  } catch (err) {
    console.error('Auth middleware error:', err);
    return res.status(401).json({ error: 'Unauthorized' });
  }
}

module.exports = authMiddleware;
