// YouTube channel videos endpoint - GET recent videos from a channel
import { requireParentAuth } from './utils/auth.js';
import { getChannelVideos } from './utils/youtube.js';
import { successResponse, errorResponse, handleOptions } from './utils/response.js';

export default async (req, context) => {
  if (req.method === 'OPTIONS') {
    return handleOptions();
  }

  if (req.method !== 'GET') {
    return errorResponse({ message: 'Method not allowed' }, 405);
  }

  try {
    // Require parent authentication
    requireParentAuth(req);

    // Extract channelId from path
    const pathParts = new URL(req.url).pathname.split('/').filter(Boolean);
    const channelId = pathParts[pathParts.length - 1];

    // Get videos from YouTube
    const videos = await getChannelVideos(channelId);

    return successResponse({ videos });
  } catch (error) {
    return errorResponse(error, error.message === 'Authentication required' ? 401 : 500);
  }
};
