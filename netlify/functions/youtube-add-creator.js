import { extractChannelInfo, getChannelInfo } from './utils/youtube.js';
import { addApprovedCreator } from './utils/db.js';

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
    const { channelUrl } = JSON.parse(event.body);

    // Extract channel info from URL
    const channelInfo = extractChannelInfo(channelUrl);
    if (!channelInfo) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Invalid YouTube channel URL' })
      };
    }

    // Fetch channel info from YouTube API
    const channelData = await getChannelInfo(channelInfo);

    // Add to database
    const added = await addApprovedCreator(profileId, channelData);

    return {
      statusCode: 201,
      body: JSON.stringify(added)
    };
  } catch (error) {
    console.error('Error adding creator:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message || 'Failed to add creator' })
    };
  }
}
