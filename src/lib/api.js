// API client for making requests to Netlify functions

const API_BASE = '/api';

async function request(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const config = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  };

  if (config.body && typeof config.body !== 'string') {
    config.body = JSON.stringify(config.body);
  }

  const response = await fetch(url, config);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Request failed');
  }

  return data;
}

export const api = {
  // Profiles
  getProfiles() {
    return request('/profiles');
  },

  getProfile(profileId) {
    return request(`/profile-detail?id=${profileId}`);
  },

  // Creators
  getCreators(profileId) {
    return request(`/profile-creators?profileId=${profileId}`);
  },

  addCreator(profileId, creator) {
    return request(`/profile-creators?profileId=${profileId}`, {
      method: 'POST',
      body: creator,
    });
  },

  removeCreator(profileId, channelId) {
    return request(`/profile-creators?profileId=${profileId}`, {
      method: 'DELETE',
      body: { channelId },
    });
  },

  // Videos
  getVideos(profileId) {
    return request(`/profile-videos?profileId=${profileId}`);
  },

  addVideo(profileId, video) {
    return request(`/profile-videos?profileId=${profileId}`, {
      method: 'POST',
      body: video,
    });
  },

  removeVideo(profileId, videoId) {
    return request(`/profile-videos?profileId=${profileId}`, {
      method: 'DELETE',
      body: { videoId },
    });
  },

  blockVideo(profileId, videoId, reason) {
    return request(`/profile-videos?profileId=${profileId}`, {
      method: 'POST',
      body: { action: 'block', videoId, reason },
    });
  },

  unblockVideo(profileId, videoId) {
    return request(`/profile-videos?profileId=${profileId}`, {
      method: 'DELETE',
      body: { action: 'unblock', videoId },
    });
  },

  // Watch History
  getHistory(profileId, limit = 50) {
    return request(`/profile-history?profileId=${profileId}&limit=${limit}`);
  },

  recordWatch(profileId, videoId, videoTitle, watchDuration) {
    return request(`/profile-history?profileId=${profileId}`, {
      method: 'POST',
      body: { videoId, videoTitle, watchDuration },
    });
  },
};
