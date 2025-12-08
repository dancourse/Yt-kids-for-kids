// API client for making requests to Netlify functions
import { auth } from './auth';

const API_BASE = '/api';

async function request(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const config = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...auth.getAuthHeaders(),
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
  // Authentication
  parentLogin(password) {
    return request('/auth-parent-login', {
      method: 'POST',
      body: { password },
    });
  },

  kidLogin(profileId, pin) {
    return request('/auth-kid-login', {
      method: 'POST',
      body: { profileId, pin },
    });
  },

  // Profiles
  getProfiles() {
    return request('/profiles');
  },

  getPublicProfile(profileId) {
    return request(`/profiles-${profileId}-public`);
  },

  updateProfile(profileId, data) {
    return request(`/profiles-${profileId}`, {
      method: 'PUT',
      body: data,
    });
  },

  // Creators
  getCreators(profileId) {
    return request(`/profiles-${profileId}-creators`);
  },

  addCreator(profileId, channelUrl) {
    return request(`/profiles-${profileId}-creators`, {
      method: 'POST',
      body: { channelUrl },
    });
  },

  removeCreator(profileId, channelId) {
    return request(`/profiles-${profileId}-creators-${channelId}`, {
      method: 'DELETE',
    });
  },

  // Videos
  getVideos(profileId) {
    return request(`/profiles-${profileId}-videos`);
  },

  addVideo(profileId, videoUrl) {
    return request(`/profiles-${profileId}-videos`, {
      method: 'POST',
      body: { videoUrl },
    });
  },

  removeVideo(profileId, videoId) {
    return request(`/profiles-${profileId}-videos-${videoId}`, {
      method: 'DELETE',
    });
  },

  blockVideo(profileId, videoId, reason) {
    return request(`/profiles-${profileId}-videos-${videoId}-block`, {
      method: 'POST',
      body: { reason },
    });
  },

  unblockVideo(profileId, videoId) {
    return request(`/profiles-${profileId}-blocked-${videoId}`, {
      method: 'DELETE',
    });
  },

  // Watch History
  getHistory(profileId) {
    return request(`/profiles-${profileId}-history`);
  },

  recordWatch(profileId, videoId, watchDuration) {
    return request(`/profiles-${profileId}-history`, {
      method: 'POST',
      body: { videoId, watchDuration },
    });
  },

  // YouTube helpers
  getChannelVideos(channelId) {
    return request(`/youtube-channel-videos-${channelId}`);
  },

  getVideoInfo(videoId) {
    return request(`/youtube-video-info-${videoId}`);
  },
};
