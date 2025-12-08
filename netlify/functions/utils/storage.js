// Netlify Blobs storage utilities
import { getStore } from '@netlify/blobs';

// Get a blob store instance
// In production on Netlify, getStore() auto-detects context
export function getBlobStore() {
  return getStore('kiddotube');
}

// Get data from blob storage
export async function getBlob(key) {
  const store = getBlobStore();
  const data = await store.get(key, { type: 'json' });
  return data || null;
}

// Set data in blob storage
export async function setBlob(key, value) {
  const store = getBlobStore();
  await store.setJSON(key, value);
}

// Delete data from blob storage
export async function deleteBlob(key) {
  const store = getBlobStore();
  await store.delete(key);
}

// Initialize default data structure if not exists
export async function initializeData() {
  const config = await getBlob('config');
  if (!config) {
    await setBlob('config', {
      parentPasswordHash: process.env.PARENT_PASSWORD_HASH || '',
      createdAt: new Date().toISOString(),
    });
  }

  const profiles = await getBlob('profiles');
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
    });
  }

  // Initialize approvals for each profile
  for (const profileId of ['profile_1', 'profile_2']) {
    const approvals = await getBlob(`approvals_${profileId}`);
    if (!approvals) {
      await setBlob(`approvals_${profileId}`, {
        profileId,
        approvedCreators: [],
        approvedVideos: [],
        blockedVideos: [],
      });
    }

    const history = await getBlob(`history_${profileId}`);
    if (!history) {
      await setBlob(`history_${profileId}`, {
        profileId,
        watches: [],
      });
    }
  }
}
