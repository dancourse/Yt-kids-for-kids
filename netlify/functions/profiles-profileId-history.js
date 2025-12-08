// Watch history endpoint - GET/POST history for a profile
import { getBlob, setBlob, initializeData } from './utils/storage.js';
import { requireParentAuth, requireAuth } from './utils/auth.js';
import { successResponse, errorResponse, handleOptions } from './utils/response.js';

export default async (req, context) => {
  if (req.method === 'OPTIONS') {
    return handleOptions();
  }

  try {
    // Ensure data is initialized
    await initializeData(context);

    // Extract profileId from path
    const pathParts = new URL(req.url).pathname.split('/').filter(Boolean);
    const profileId = pathParts[pathParts.length - 2];

    if (req.method === 'GET') {
      // Require parent authentication to view history
      requireParentAuth(req);

      const history = await getBlob(`history_${profileId}`, context);
      return successResponse({ watches: history.watches || [] });
    }

    if (req.method === 'POST') {
      // Kids can record their watch history
      const payload = requireAuth(req);

      // If kid auth, verify it's their profile
      if (payload.role === 'kid' && payload.profileId !== profileId) {
        return errorResponse({ message: 'Unauthorized access to this profile' }, 403);
      }

      const { videoId, watchDuration, title } = await req.json();

      if (!videoId) {
        return errorResponse({ message: 'Video ID is required' }, 400);
      }

      // Get current history
      const history = await getBlob(`history_${profileId}`, context);

      // Add watch record
      history.watches.push({
        videoId,
        title: title || 'Unknown Video',
        watchedAt: new Date().toISOString(),
        watchDuration: watchDuration || 0,
      });

      // Keep only last 100 watches to avoid bloat
      if (history.watches.length > 100) {
        history.watches = history.watches.slice(-100);
      }

      await setBlob(`history_${profileId}`, history, context);

      return successResponse({ success: true });
    }

    return errorResponse({ message: 'Method not allowed' }, 405);
  } catch (error) {
    return errorResponse(error, error.message === 'Authentication required' ? 401 : 500);
  }
};
