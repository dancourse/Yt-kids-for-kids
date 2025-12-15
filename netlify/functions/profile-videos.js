import { getApprovedVideos, addApprovedVideo, removeApprovedVideo, getBlockedVideos, blockVideo, unblockVideo } from './utils/db.js';

export async function handler(event) {
  const profileId = event.queryStringParameters?.profileId;

  if (!profileId) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Profile ID is required' })
    };
  }

  try {
    // GET - List all approved videos and blocked videos for a profile
    if (event.httpMethod === 'GET') {
      const [approvedVideos, blockedVideos] = await Promise.all([
        getApprovedVideos(profileId),
        getBlockedVideos(profileId)
      ]);
      return {
        statusCode: 200,
        body: JSON.stringify({ approvedVideos, blockedVideos })
      };
    }

    // POST - Add a new approved video or block a video
    if (event.httpMethod === 'POST') {
      const data = JSON.parse(event.body);
      
      if (data.action === 'block') {
        const blocked = await blockVideo(profileId, data.videoId, data.reason);
        return {
          statusCode: 201,
          body: JSON.stringify(blocked)
        };
      } else {
        const added = await addApprovedVideo(profileId, data);
        return {
          statusCode: 201,
          body: JSON.stringify(added)
        };
      }
    }

    // DELETE - Remove an approved video or unblock a video
    if (event.httpMethod === 'DELETE') {
      const { videoId, action } = JSON.parse(event.body);
      
      if (action === 'unblock') {
        await unblockVideo(profileId, videoId);
      } else {
        await removeApprovedVideo(profileId, videoId);
      }
      
      return {
        statusCode: 200,
        body: JSON.stringify({ success: true })
      };
    }

    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  } catch (error) {
    console.error('Error managing videos:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to manage videos' })
    };
  }
}
