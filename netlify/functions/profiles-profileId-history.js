// Watch history endpoint - GET/POST history for a profile
import { getBlob, setBlob, initializeData } from './utils/storage.js';
import { requireParentAuth, requireAuth } from './utils/auth.js';
import { successResponse, errorResponse, handleOptions } from './utils/response.js';

export async function handler(event) {
  if (event.httpMethod === 'OPTIONS') {
    return handleOptions();
  }

  try {
    // Ensure data is initialized
    await initializeData();

    // Extract profileId from path
    const pathParts = event.path.split('/').filter(Boolean);
    const profileId = pathParts[pathParts.length - 2];

    if (event.httpMethod === 'GET') {
      // Require parent authentication to view history
      requireParentAuth(event);

      const history = await getBlob(`history_${profileId}`);
      return successResponse({ watches: history.watches || [] });
    }

    if (event.httpMethod === 'POST') {
      // Kids can record their watch history
      const payload = requireAuth(event);

      // If kid auth, verify it's their profile
      if (payload.role === 'kid' && payload.profileId !== profileId) {
        return errorResponse({ message: 'Unauthorized access to this profile' }, 403);
      }

      const { videoId, watchDuration, title } = JSON.parse(event.body);

      if (!videoId) {
        return errorResponse({ message: 'Video ID is required' }, 400);
      }

      // Get current history
      const history = await getBlob(`history_${profileId}`);

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

      await setBlob(`history_${profileId}`, history);

      return successResponse({ success: true });
    }

    return errorResponse({ message: 'Method not allowed' }, 405);
  } catch (error) {
    return errorResponse(error, error.message === 'Authentication required' ? 401 : 500);
  }
}
