/**
 * Authentication Middleware
 * 
 * PURPOSE:
 * This middleware validates JWT tokens on protected routes BEFORE the route handler executes.
 * It ensures only authenticated users can access protected endpoints.
 * 
 * IMPORTANT DISTINCTION:
 * - This file (middleware/auth.js) = Validates tokens (middleware)
 * - api/auth.js = Handles login/register/logout (business logic)
 * 
 * Both files are needed and serve different purposes.
 * 
 * HOW IT WORKS:
 * 1. Extracts JWT token from Authorization header
 * 2. Validates token with Supabase Auth
 * 3. Attaches user object to req.user
 * 4. Calls next() to proceed to route handler
 * 5. Returns 401 error if token is invalid
 * 
 * USAGE EXAMPLE:
 * ```javascript
 * const { authenticateUser } = require('../middleware/auth');
 * 
 * // Protect a route
 * router.get('/sessions', authenticateUser, async (req, res) => {
 *   // req.user is now available
 *   const sessions = await getSessions(req.user.id);
 *   res.json(sessions);
 * });
 * ```
 * 
 * USED BY:
 * - routes/sessions.js (GET /api/sessions, DELETE /api/sessions/:id)
 * - routes/userProfiles.js (GET /api/profiles/me, PUT /api/profiles/subscription)
 * - Any route that requires authentication
 * 
 * WHY IT'S IMPORTANT:
 * - Security: Prevents unauthorized access to protected resources
 * - User Context: Provides user information to route handlers
 * - Centralized: Single place for authentication logic
 * - Reusable: Can be applied to any route that needs auth
 */

const { supabaseAdmin } = require('../config/supabase');

/**
 * Authenticate user from JWT token
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * 
 * @returns {void} Calls next() on success, sends 401 on failure
 * 
 * @example
 * // In a route file:
 * router.get('/protected', authenticateUser, (req, res) => {
 *   console.log(req.user.id); // User ID is available
 *   res.json({ message: 'Authenticated!' });
 * });
 */
async function authenticateUser(req, res, next) {
  try {
    // Extract token from Authorization header (format: "Bearer <token>")
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    // Verify token with Supabase Auth and get user
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    // Attach user to request object for use in route handlers
    req.user = user;
    
    // Proceed to next middleware or route handler
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(401).json({ error: 'Authentication failed' });
  }
}

module.exports = {
  authenticateUser
};
