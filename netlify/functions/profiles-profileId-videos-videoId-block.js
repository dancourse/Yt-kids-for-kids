// Block video endpoint
import { getBlob, setBlob, initializeData } from './utils/storage.js';
import { requireParentAuth } from './utils/auth.js';
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

    // Require parent authentication
    requireParentAuth(event);

    // Extract profileId and videoId from path
    const pathParts = event.path.split('/').filter(Boolean);
    const videoId = pathParts[pathParts.length - 2];
    const profileId = pathParts[pathParts.length - 4];

    const body = event.body ? JSON.parse(event.body) : {};
    const { reason } = body;

    // Get current approvals
    const approvals = await getBlob(`approvals_${profileId}`);

    // Check if already blocked
    const alreadyBlocked = approvals.blockedVideos.some(
      v => v.videoId === videoId
    );

    if (alreadyBlocked) {
      return errorResponse({ message: 'Video already blocked' }, 400);
    }

    // Add to blocked list
    approvals.blockedVideos.push({
      videoId,
      reason: reason || '',
      blockedAt: new Date().toISOString(),
    });

    await setBlob(`approvals_${profileId}`, approvals);

    return successResponse({ success: true });
  } catch (error) {
    return errorResponse(error, error.message === 'Authentication required' ? 401 : 500);
  }
}
