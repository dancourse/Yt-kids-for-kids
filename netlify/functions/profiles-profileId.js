// Profile endpoint - GET/PUT single profile
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

    // Extract profileId from path
    const profileId = new URL(req.url).pathname.split('/').filter(Boolean).pop();

    if (req.method === 'PUT') {
      // Require parent authentication
      requireParentAuth(req);

      const { avatarId, sillyName, pin } = await req.json();

      // Get current profiles
      const profilesData = await getBlob('profiles', context);
      const profileIndex = profilesData.profiles.findIndex(p => p.id === profileId);

      if (profileIndex === -1) {
        return errorResponse({ message: 'Profile not found' }, 404);
      }

      // Update profile
      if (avatarId) profilesData.profiles[profileIndex].avatarId = avatarId;
      if (sillyName) profilesData.profiles[profileIndex].sillyName = sillyName;
      if (pin) profilesData.profiles[profileIndex].pinHash = hashPassword(pin);

      // Save updated profiles
      await setBlob('profiles', profilesData, context);

      return successResponse({
        success: true,
        profile: profilesData.profiles[profileIndex],
      });
    }

    return errorResponse({ message: 'Method not allowed' }, 405);
  } catch (error) {
    return errorResponse(error, error.message === 'Authentication required' ? 401 : 500);
  }
};
