import { extractVideoId, getVideoInfo } from './utils/youtube.js';
import { addApprovedVideo } from './utils/db.js';

export async function handler(event) {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  const profileId = event.queryStringParameters?.profileId;
  if (!profileId) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Profile ID is required' })
    };
  }

  try {
    const { videoUrl } = JSON.parse(event.body);

    // Extract video ID from URL
    const videoId = extractVideoId(videoUrl);
    if (!videoId) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Invalid YouTube video URL' })
      };
    }

    // Fetch video info from YouTube API
    const videoInfo = await getVideoInfo(videoId);

    // Add to database
    const added = await addApprovedVideo(profileId, videoInfo);

    return {
      statusCode: 201,
      body: JSON.stringify(added)
    };
  } catch (error) {
    console.error('Error adding video:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message || 'Failed to add video' })
    };
  }
}
