// Videos endpoint - GET/POST videos for a profile
import { getBlob, setBlob, initializeData } from './utils/storage.js';
import { requireParentAuth, requireAuth } from './utils/auth.js';
import { getVideoFromUrl } from './utils/youtube.js';
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
      // Kids can view videos with their auth
      const payload = requireAuth(event);

      // If kid auth, verify it's their profile
      if (payload.role === 'kid' && payload.profileId !== profileId) {
        return errorResponse({ message: 'Unauthorized access to this profile' }, 403);
      }

      const approvals = await getBlob(`approvals_${profileId}`);

      // Filter out blocked videos
      const blockedVideoIds = new Set(approvals.blockedVideos.map(v => v.videoId));
      const approvedVideos = approvals.approvedVideos.filter(
        v => !blockedVideoIds.has(v.videoId)
      );

      return successResponse({ videos: approvedVideos });
    }

    if (event.httpMethod === 'POST') {
      // Require parent authentication to add videos
      requireParentAuth(event);

      const { videoUrl } = JSON.parse(event.body);

      if (!videoUrl) {
        return errorResponse({ message: 'Video URL is required' }, 400);
      }

      // Get video info from YouTube
      const videoInfo = await getVideoFromUrl(videoUrl);

      // Get current approvals
      const approvals = await getBlob(`approvals_${profileId}`);

      // Check if video already exists
      const exists = approvals.approvedVideos.some(
        v => v.videoId === videoInfo.videoId
      );

      if (exists) {
        return errorResponse({ message: 'Video already added' }, 400);
      }

      // Add video
      const newVideo = {
        videoId: videoInfo.videoId,
        title: videoInfo.title,
        thumbnail: videoInfo.thumbnail,
        channelName: videoInfo.channelName,
        duration: videoInfo.duration,
        addedAt: new Date().toISOString(),
        source: 'manual',
      };

      approvals.approvedVideos.push(newVideo);
      await setBlob(`approvals_${profileId}`, approvals);

      return successResponse({
        success: true,
        video: newVideo,
      });
    }

    return errorResponse({ message: 'Method not allowed' }, 405);
  } catch (error) {
    return errorResponse(error, error.message === 'Authentication required' ? 401 : 500);
  }
}
