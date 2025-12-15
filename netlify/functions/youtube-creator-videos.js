import { getChannelVideos } from './utils/youtube.js';

export async function handler(event) {
  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  const channelId = event.queryStringParameters?.channelId;
  if (!channelId) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Channel ID is required' })
    };
  }

  try {
    const videos = await getChannelVideos(channelId);
    return {
      statusCode: 200,
      body: JSON.stringify({ videos })
    };
  } catch (error) {
    console.error('Error fetching channel videos:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message || 'Failed to fetch channel videos' })
    };
  }
}
