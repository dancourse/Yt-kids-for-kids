import { getProfile } from './utils/db.js';

export async function handler(event) {
  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const profileId = event.queryStringParameters?.id;
    
    if (!profileId) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Profile ID is required' })
      };
    }

    const profile = await getProfile(profileId);

    if (!profile) {
      return {
        statusCode: 404,
        body: JSON.stringify({ error: 'Profile not found' })
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify(profile)
    };
  } catch (error) {
    console.error('Error fetching profile:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to fetch profile' })
    };
  }
}
