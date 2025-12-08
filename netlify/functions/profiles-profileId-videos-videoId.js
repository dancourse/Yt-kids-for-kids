// Delete video endpoint
import { getBlob, setBlob, initializeData } from './utils/storage.js';
import { requireParentAuth } from './utils/auth.js';
import { successResponse, errorResponse, handleOptions } from './utils/response.js';

export default async (req, context) => {
  if (req.method === 'OPTIONS') {
    return handleOptions();
  }

  if (req.method !== 'DELETE') {
    return errorResponse({ message: 'Method not allowed' }, 405);
  }

  try {
    // Ensure data is initialized
    await initializeData(context);

    // Require parent authentication
    requireParentAuth(req);

    // Extract profileId and videoId from path
    const pathParts = new URL(req.url).pathname.split('/').filter(Boolean);
    const videoId = pathParts[pathParts.length - 1];
    const profileId = pathParts[pathParts.length - 3];

    // Get current approvals
    const approvals = await getBlob(`approvals_${profileId}`, context);

    // Remove video
    approvals.approvedVideos = approvals.approvedVideos.filter(
      v => v.videoId !== videoId
    );

    await setBlob(`approvals_${profileId}`, approvals, context);

    return successResponse({ success: true });
  } catch (error) {
    return errorResponse(error, error.message === 'Authentication required' ? 401 : 500);
  }
};
