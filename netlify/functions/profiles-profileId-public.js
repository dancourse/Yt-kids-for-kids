// Public profile endpoint - GET profile info without auth (for profile select screen)
import { getBlob, initializeData } from './utils/storage.js';
import { successResponse, errorResponse, handleOptions } from './utils/response.js';

export default async (req, context) => {
  if (req.method === 'OPTIONS') {
    return handleOptions();
  }

  if (req.method !== 'GET') {
    return errorResponse({ message: 'Method not allowed' }, 405);
  }

  try {
    // Ensure data is initialized
    await initializeData(context);

    // Extract profileId from path
    const pathParts = new URL(req.url).pathname.split('/').filter(Boolean);
    const profileId = pathParts[pathParts.length - 2]; // Second to last part

    const profilesData = await getBlob('profiles', context);
    const profile = profilesData.profiles.find(p => p.id === profileId);

    if (!profile) {
      return errorResponse({ message: 'Profile not found' }, 404);
    }

    // Return only public info (no PIN hash)
    return successResponse({
      id: profile.id,
      avatarId: profile.avatarId,
      sillyName: profile.sillyName,
    });
  } catch (error) {
    return errorResponse(error, 500);
  }
};
