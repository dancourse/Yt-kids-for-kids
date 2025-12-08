// Profiles endpoint - GET all profiles (parent auth required)
import { getBlob, setBlob, initializeData } from './utils/storage.js';
import { requireParentAuth, hashPassword } from './utils/auth.js';
import { successResponse, errorResponse, handleOptions } from './utils/response.js';

export default async (req, context) => {
  if (req.method === 'OPTIONS') {
    return handleOptions();
  }

  try {
    // Ensure data is initialized
    await initializeData(context);

    if (req.method === 'GET') {
      // Require parent authentication
      requireParentAuth(req);

      const profilesData = await getBlob('profiles', context);
      return successResponse({ profiles: profilesData.profiles });
    }

    return errorResponse({ message: 'Method not allowed' }, 405);
  } catch (error) {
    return errorResponse(error, error.message === 'Authentication required' ? 401 : 500);
  }
};
