// YouTube video info endpoint - GET info about a single video
import { requireParentAuth } from './utils/auth.js';
import { getVideoInfo } from './utils/youtube.js';
import { successResponse, errorResponse, handleOptions } from './utils/response.js';

export async function handler(event) {
  if (event.httpMethod === 'OPTIONS') {
    return handleOptions();
  }

  if (event.httpMethod !== 'GET') {
    return errorResponse({ message: 'Method not allowed' }, 405);
  }

  try {
    // Require parent authentication
    requireParentAuth(event);

    // Extract videoId from path
    const pathParts = event.path.split('/').filter(Boolean);
    const videoId = pathParts[pathParts.length - 1];

    // Get video info from YouTube
    const video = await getVideoInfo(videoId);

    return successResponse(video);
  } catch (error) {
    return errorResponse(error, error.message === 'Authentication required' ? 401 : 500);
  }
}
