// Creators endpoint - GET/POST creators for a profile
import { getBlob, setBlob, initializeData } from './utils/storage.js';
import { requireParentAuth } from './utils/auth.js';
import { getChannelFromUrl } from './utils/youtube.js';
import { successResponse, errorResponse, handleOptions } from './utils/response.js';

export default async (req, context) => {
  if (req.method === 'OPTIONS') {
    return handleOptions();
  }

  try {
    // Ensure data is initialized
    await initializeData(context);

    // Require parent authentication
    requireParentAuth(req);

    // Extract profileId from path
    const pathParts = new URL(req.url).pathname.split('/').filter(Boolean);
    const profileId = pathParts[pathParts.length - 2]; // Second to last part

    if (req.method === 'GET') {
      const approvals = await getBlob(`approvals_${profileId}`, context);
      return successResponse({ creators: approvals.approvedCreators || [] });
    }

    if (req.method === 'POST') {
      const { channelUrl, approveAllVideos = true } = await req.json();

      if (!channelUrl) {
        return errorResponse({ message: 'Channel URL is required' }, 400);
      }

      // Get channel info from YouTube
      const channelInfo = await getChannelFromUrl(channelUrl);

      // Get current approvals
      const approvals = await getBlob(`approvals_${profileId}`, context);

      // Check if creator already exists
      const exists = approvals.approvedCreators.some(
        c => c.channelId === channelInfo.channelId
      );

      if (exists) {
        return errorResponse({ message: 'Creator already added' }, 400);
      }

      // Add creator
      approvals.approvedCreators.push({
        channelId: channelInfo.channelId,
        channelName: channelInfo.channelName,
        channelThumbnail: channelInfo.channelThumbnail,
        approveAllVideos,
        addedAt: new Date().toISOString(),
      });

      await setBlob(`approvals_${profileId}`, approvals, context);

      return successResponse({
        success: true,
        creator: approvals.approvedCreators[approvals.approvedCreators.length - 1],
      });
    }

    return errorResponse({ message: 'Method not allowed' }, 405);
  } catch (error) {
    return errorResponse(error, error.message === 'Authentication required' ? 401 : 500);
  }
};
