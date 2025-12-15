import { getProfiles } from './utils/db.js';

export async function handler(event) {
  // Only allow GET requests
  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const profiles = await getProfiles();

    return {
      statusCode: 200,
      body: JSON.stringify({ profiles })
    };
  } catch (error) {
    console.error('Error fetching profiles:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to fetch profiles' })
    };
  }
}
