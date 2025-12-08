// LocalStorage-based storage for KiddoTube
// Replaces Netlify Blobs with browser localStorage

const STORAGE_KEYS = {
  PROFILES: 'kiddotube_profiles',
  APPROVALS: 'kiddotube_approvals',
  HISTORY: 'kiddotube_history',
};

// Initialize default data
export function initializeStorage() {
  // Initialize profiles if not exists
  if (!localStorage.getItem(STORAGE_KEYS.PROFILES)) {
    const defaultProfiles = [
      {
        id: 'profile_1',
        avatarId: 'rocket',
        sillyName: 'Captain Bubbles',
        createdAt: new Date().toISOString(),
      },
      {
        id: 'profile_2',
        avatarId: 'dinosaur',
        sillyName: 'Professor Giggles',
        createdAt: new Date().toISOString(),
      },
    ];
    localStorage.setItem(STORAGE_KEYS.PROFILES, JSON.stringify(defaultProfiles));
  }

  // Initialize approvals for each profile if not exists
  if (!localStorage.getItem(STORAGE_KEYS.APPROVALS)) {
    const defaultApprovals = {
      profile_1: {
        approvedCreators: [],
        approvedVideos: [],
        blockedVideos: [],
      },
      profile_2: {
        approvedCreators: [],
        approvedVideos: [],
        blockedVideos: [],
      },
    };
    localStorage.setItem(STORAGE_KEYS.APPROVALS, JSON.stringify(defaultApprovals));
  }

  // Initialize history for each profile if not exists
  if (!localStorage.getItem(STORAGE_KEYS.HISTORY)) {
    const defaultHistory = {
      profile_1: { watches: [] },
      profile_2: { watches: [] },
    };
    localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(defaultHistory));
  }
}

// Profiles
export function getProfiles() {
  initializeStorage();
  const data = localStorage.getItem(STORAGE_KEYS.PROFILES);
  return data ? JSON.parse(data) : [];
}

export function getProfile(profileId) {
  const profiles = getProfiles();
  return profiles.find(p => p.id === profileId) || null;
}

export function updateProfile(profileId, updates) {
  const profiles = getProfiles();
  const index = profiles.findIndex(p => p.id === profileId);
  if (index !== -1) {
    profiles[index] = { ...profiles[index], ...updates };
    localStorage.setItem(STORAGE_KEYS.PROFILES, JSON.stringify(profiles));
  }
  return profiles[index];
}

// Approvals
export function getApprovals(profileId) {
  initializeStorage();
  const data = localStorage.getItem(STORAGE_KEYS.APPROVALS);
  const approvals = data ? JSON.parse(data) : {};
  return approvals[profileId] || { approvedCreators: [], approvedVideos: [], blockedVideos: [] };
}

export function addCreator(profileId, creator) {
  const approvals = JSON.parse(localStorage.getItem(STORAGE_KEYS.APPROVALS) || '{}');
  if (!approvals[profileId]) {
    approvals[profileId] = { approvedCreators: [], approvedVideos: [], blockedVideos: [] };
  }

  // Check if creator already exists
  const exists = approvals[profileId].approvedCreators.find(c => c.channelId === creator.channelId);
  if (!exists) {
    approvals[profileId].approvedCreators.push({
      ...creator,
      addedAt: new Date().toISOString(),
    });
    localStorage.setItem(STORAGE_KEYS.APPROVALS, JSON.stringify(approvals));
  }
  return approvals[profileId];
}

export function removeCreator(profileId, channelId) {
  const approvals = JSON.parse(localStorage.getItem(STORAGE_KEYS.APPROVALS) || '{}');
  if (approvals[profileId]) {
    approvals[profileId].approvedCreators = approvals[profileId].approvedCreators.filter(
      c => c.channelId !== channelId
    );
    localStorage.setItem(STORAGE_KEYS.APPROVALS, JSON.stringify(approvals));
  }
  return approvals[profileId];
}

export function addVideo(profileId, video) {
  const approvals = JSON.parse(localStorage.getItem(STORAGE_KEYS.APPROVALS) || '{}');
  if (!approvals[profileId]) {
    approvals[profileId] = { approvedCreators: [], approvedVideos: [], blockedVideos: [] };
  }

  // Check if video already exists
  const exists = approvals[profileId].approvedVideos.find(v => v.videoId === video.videoId);
  if (!exists) {
    approvals[profileId].approvedVideos.push({
      ...video,
      addedAt: new Date().toISOString(),
    });
    localStorage.setItem(STORAGE_KEYS.APPROVALS, JSON.stringify(approvals));
  }
  return approvals[profileId];
}

export function removeVideo(profileId, videoId) {
  const approvals = JSON.parse(localStorage.getItem(STORAGE_KEYS.APPROVALS) || '{}');
  if (approvals[profileId]) {
    approvals[profileId].approvedVideos = approvals[profileId].approvedVideos.filter(
      v => v.videoId !== videoId
    );
    localStorage.setItem(STORAGE_KEYS.APPROVALS, JSON.stringify(approvals));
  }
  return approvals[profileId];
}

export function blockVideo(profileId, videoId, reason) {
  const approvals = JSON.parse(localStorage.getItem(STORAGE_KEYS.APPROVALS) || '{}');
  if (!approvals[profileId]) {
    approvals[profileId] = { approvedCreators: [], approvedVideos: [], blockedVideos: [] };
  }

  // Check if video already blocked
  const exists = approvals[profileId].blockedVideos.find(v => v.videoId === videoId);
  if (!exists) {
    approvals[profileId].blockedVideos.push({
      videoId,
      reason: reason || 'No reason provided',
      blockedAt: new Date().toISOString(),
    });
    localStorage.setItem(STORAGE_KEYS.APPROVALS, JSON.stringify(approvals));
  }
  return approvals[profileId];
}

export function unblockVideo(profileId, videoId) {
  const approvals = JSON.parse(localStorage.getItem(STORAGE_KEYS.APPROVALS) || '{}');
  if (approvals[profileId]) {
    approvals[profileId].blockedVideos = approvals[profileId].blockedVideos.filter(
      v => v.videoId !== videoId
    );
    localStorage.setItem(STORAGE_KEYS.APPROVALS, JSON.stringify(approvals));
  }
  return approvals[profileId];
}

// Watch History
export function getHistory(profileId) {
  initializeStorage();
  const data = localStorage.getItem(STORAGE_KEYS.HISTORY);
  const history = data ? JSON.parse(data) : {};
  return history[profileId] || { watches: [] };
}

export function recordWatch(profileId, videoId, watchDuration, videoTitle) {
  const history = JSON.parse(localStorage.getItem(STORAGE_KEYS.HISTORY) || '{}');
  if (!history[profileId]) {
    history[profileId] = { watches: [] };
  }

  history[profileId].watches.push({
    videoId,
    videoTitle,
    watchDuration,
    timestamp: new Date().toISOString(),
  });

  localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(history));
  return history[profileId];
}

// Get all approved videos for a profile (including creator videos)
export async function getAllVideosForProfile(profileId) {
  const approvals = getApprovals(profileId);
  const videos = [...approvals.approvedVideos];

  // We'll need to fetch creator videos from YouTube API
  // This will be handled in the component since we need the API

  return videos;
}
