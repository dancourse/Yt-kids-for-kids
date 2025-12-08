// YouTube video info endpoint - GET info about a single video
import { requireParentAuth } from './utils/auth.js';
import { getVideoInfo } from './utils/youtube.js';
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

    // Extract videoId from path
    const pathParts = new URL(req.url).pathname.split('/').filter(Boolean);
    const videoId = pathParts[pathParts.length - 1];

    // Get video info from YouTube
    const video = await getVideoInfo(videoId);

    return successResponse(video);
  } catch (error) {
    return errorResponse(error, error.message === 'Authentication required' ? 401 : 500);
  }
};
