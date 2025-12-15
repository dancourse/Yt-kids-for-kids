import { getWatchHistory, recordWatch } from './utils/db.js';

export async function handler(event) {
  const profileId = event.queryStringParameters?.profileId;

  if (!profileId) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Profile ID is required' })
    };
  }

  try {
    // GET - Get watch history for a profile
    if (event.httpMethod === 'GET') {
      const limit = event.queryStringParameters?.limit 
        ? parseInt(event.queryStringParameters.limit) 
        : 50;
      
      const history = await getWatchHistory(profileId, limit);
      return {
        statusCode: 200,
        body: JSON.stringify({ history })
      };
    }

    // POST - Record a new watch event
    if (event.httpMethod === 'POST') {
      const { videoId, videoTitle, watchDuration } = JSON.parse(event.body);
      const recorded = await recordWatch(profileId, videoId, videoTitle, watchDuration);
      return {
        statusCode: 201,
        body: JSON.stringify(recorded)
      };
    }

    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  } catch (error) {
    console.error('Error managing watch history:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to manage watch history' })
    };
  }
}
