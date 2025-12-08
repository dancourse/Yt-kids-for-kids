// Parent login endpoint
import { getBlob, initializeData } from './utils/storage.js';
import { verifyPassword, generateToken } from './utils/auth.js';
import { successResponse, errorResponse, handleOptions } from './utils/response.js';

export async function handler(event) {
  if (event.httpMethod === 'OPTIONS') {
    return handleOptions();
  }

  if (event.httpMethod !== 'POST') {
    return errorResponse({ message: 'Method not allowed' }, 405);
  }

  try {
    // Ensure data is initialized
    await initializeData();

    const { password } = JSON.parse(event.body);

    if (!password) {
      return errorResponse({ message: 'Password is required' }, 400);
    }

    // Get config with parent password hash
    const config = await getBlob('config');
    if (!config || !config.parentPasswordHash) {
      return errorResponse({ message: 'System not configured. Please set PARENT_PASSWORD_HASH environment variable.' }, 500);
    }

    // Verify password
    const isValid = verifyPassword(password, config.parentPasswordHash);
    if (!isValid) {
      return errorResponse({ message: 'Invalid password' }, 401);
    }

    // Generate token
    const token = generateToken({ role: 'parent' }, '24h');

    return successResponse({
      success: true,
      token,
    });
  } catch (error) {
    return errorResponse(error, 500);
  }
}
