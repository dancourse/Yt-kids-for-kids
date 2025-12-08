// Kid login endpoint
import { getBlob, initializeData } from './utils/storage.js';
import { verifyPassword, generateToken } from './utils/auth.js';
import { successResponse, errorResponse, handleOptions } from './utils/response.js';

export async function handler(event) {
  if (event.httpMethod === 'OPTIONS') {
    return handleOptions();
  }

  if (event.httpMethod !== 'POST') {
    return errorResponse({ message: 'Method not allowed' }, 405);
  }

  try {
    // Ensure data is initialized
    await initializeData();

    const { profileId, pin } = JSON.parse(event.body);

    if (!profileId || !pin) {
      return errorResponse({ message: 'Profile ID and PIN are required' }, 400);
    }

    // Get profiles
    const profilesData = await getBlob('profiles');
    if (!profilesData) {
      return errorResponse({ message: 'Profiles not found' }, 404);
    }

    // Find the profile
    const profile = profilesData.profiles.find(p => p.id === profileId);
    if (!profile) {
      return errorResponse({ message: 'Profile not found' }, 404);
    }

    // Check if PIN is set
    if (!profile.pinHash) {
      return errorResponse({ message: 'PIN not set for this profile. Please set it in parent dashboard.' }, 400);
    }

    // Verify PIN
    const isValid = verifyPassword(pin, profile.pinHash);
    if (!isValid) {
      return errorResponse({ message: 'Invalid PIN' }, 401);
    }

    // Generate token
    const token = generateToken({ role: 'kid', profileId }, '4h');

    return successResponse({
      success: true,
      token,
      profile: {
        id: profile.id,
        avatarId: profile.avatarId,
        sillyName: profile.sillyName,
      },
    });
  } catch (error) {
    return errorResponse(error, 500);
  }
}
