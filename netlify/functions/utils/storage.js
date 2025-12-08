// Netlify Blobs storage utilities
import { getStore } from '@netlify/blobs';

// Get a blob store instance (requires Netlify function context)
export function getBlobStore(context) {
  return getStore({
    name: 'kiddotube',
    context
  });
}

// Get data from blob storage
export async function getBlob(key, context) {
  const store = getBlobStore(context);
  const data = await store.get(key, { type: 'json' });
  return data || null;
}

// Set data in blob storage
export async function setBlob(key, value, context) {
  const store = getBlobStore(context);
  await store.setJSON(key, value);
}

// Delete data from blob storage
export async function deleteBlob(key, context) {
  const store = getBlobStore(context);
  await store.delete(key);
}

// Initialize default data structure if not exists
export async function initializeData(context) {
  const config = await getBlob('config', context);
  if (!config) {
    await setBlob('config', {
      parentPasswordHash: process.env.PARENT_PASSWORD_HASH || '',
      createdAt: new Date().toISOString(),
    }, context);
  }

  const profiles = await getBlob('profiles', context);
  if (!profiles) {
    await setBlob('profiles', {
      profiles: [
        {
          id: 'profile_1',
          avatarId: 'rocket',
          sillyName: 'Captain Bubbles',
          pinHash: '', // Will be set by parent
          createdAt: new Date().toISOString(),
        },
        {
          id: 'profile_2',
          avatarId: 'dinosaur',
          sillyName: 'Professor Giggles',
          pinHash: '', // Will be set by parent
          createdAt: new Date().toISOString(),
        },
      ],
    }, context);
  }

  // Initialize approvals for each profile
  for (const profileId of ['profile_1', 'profile_2']) {
    const approvals = await getBlob(`approvals_${profileId}`, context);
    if (!approvals) {
      await setBlob(`approvals_${profileId}`, {
        profileId,
        approvedCreators: [],
        approvedVideos: [],
        blockedVideos: [],
      }, context);
    }

    const history = await getBlob(`history_${profileId}`, context);
    if (!history) {
      await setBlob(`history_${profileId}`, {
        profileId,
        watches: [],
      }, context);
    }
  }
}
