// Profiles endpoint using Netlify DB - GET all profiles (parent auth)
import { getProfiles, initializeDatabase } from './utils/db.js';
import { requireParentAuth } from './utils/auth.js';
import { successResponse, errorResponse, handleOptions } from './utils/response.js';

export async function handler(event) {
  if (event.httpMethod === 'OPTIONS') {
    return handleOptions();
  }

  try {
    // Ensure database is initialized
    await initializeDatabase();

    if (event.httpMethod === 'GET') {
      // Require parent authentication
      requireParentAuth(event);

      // Get all profiles from database
      const profiles = await getProfiles();

      // Format response to match previous blob format
      const formattedProfiles = profiles.map(p => ({
        id: p.id,
        avatarId: p.avatar_id,
        sillyName: p.silly_name,
        pinHash: p.pin_hash,
        createdAt: p.created_at
      }));

      return successResponse({
        profiles: formattedProfiles
      });
    }

    return errorResponse({ message: 'Method not allowed' }, 405);

  } catch (error) {
    console.error('Profiles endpoint error:', error);
    return errorResponse(
      { message: error.message },
      error.message === 'Authentication required' ? 401 : 500
    );
  }
}
