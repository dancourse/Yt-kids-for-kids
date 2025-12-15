import { getApprovedCreators, addApprovedCreator, removeApprovedCreator } from './utils/db.js';

export async function handler(event) {
  const profileId = event.queryStringParameters?.profileId;

  if (!profileId) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Profile ID is required' })
    };
  }

  try {
    // GET - List all approved creators for a profile
    if (event.httpMethod === 'GET') {
      const creators = await getApprovedCreators(profileId);
      return {
        statusCode: 200,
        body: JSON.stringify({ creators })
      };
    }

    // POST - Add a new approved creator
    if (event.httpMethod === 'POST') {
      const creator = JSON.parse(event.body);
      const added = await addApprovedCreator(profileId, creator);
      return {
        statusCode: 201,
        body: JSON.stringify(added)
      };
    }

    // DELETE - Remove an approved creator
    if (event.httpMethod === 'DELETE') {
      const { channelId } = JSON.parse(event.body);
      await removeApprovedCreator(profileId, channelId);
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
    console.error('Error managing creators:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to manage creators' })
    };
  }
}
