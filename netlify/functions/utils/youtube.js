// YouTube API utilities
const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;
const YOUTUBE_API_BASE = 'https://www.googleapis.com/youtube/v3';

// Helper to make YouTube API requests
async function youtubeRequest(endpoint, params = {}) {
  const url = new URL(`${YOUTUBE_API_BASE}/${endpoint}`);
  url.searchParams.append('key', YOUTUBE_API_KEY);

  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.append(key, value);
  });

  const response = await fetch(url.toString());
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'YouTube API request failed');
  }

  return response.json();
}

// Extract video ID from various YouTube URL formats
export function extractVideoId(url) {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /^([a-zA-Z0-9_-]{11})$/, // Direct video ID
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }

  return null;
}

// Extract channel ID from YouTube URL
export function extractChannelId(url) {
  const patterns = [
    /youtube\.com\/channel\/([^\/\n?#]+)/,
    /^(UC[a-zA-Z0-9_-]{22})$/, // Direct channel ID
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }

  return null;
}

// Extract channel handle from URL
export function extractChannelHandle(url) {
  const match = url.match(/youtube\.com\/@([^\/\n?#]+)/);
  return match ? match[1] : null;
}

// Get channel info by channel ID
export async function getChannelById(channelId) {
  const data = await youtubeRequest('channels', {
    part: 'snippet,contentDetails',
    id: channelId,
  });

  if (!data.items || data.items.length === 0) {
    throw new Error('Channel not found');
  }

  const channel = data.items[0];
  return {
    channelId: channel.id,
    channelName: channel.snippet.title,
    channelThumbnail: channel.snippet.thumbnails.default.url,
    uploadsPlaylistId: channel.contentDetails.relatedPlaylists.uploads,
  };
}

// Get channel info by handle (@username)
export async function getChannelByHandle(handle) {
  const data = await youtubeRequest('search', {
    part: 'snippet',
    q: handle,
    type: 'channel',
    maxResults: 1,
  });

  if (!data.items || data.items.length === 0) {
    throw new Error('Channel not found');
  }

  const channelId = data.items[0].snippet.channelId;
  return getChannelById(channelId);
}

// Get channel info from URL
export async function getChannelFromUrl(url) {
  const channelId = extractChannelId(url);
  if (channelId) {
    return getChannelById(channelId);
  }

  const handle = extractChannelHandle(url);
  if (handle) {
    return getChannelByHandle(handle);
  }

  throw new Error('Invalid YouTube channel URL');
}

// Get video info by video ID
export async function getVideoInfo(videoId) {
  const data = await youtubeRequest('videos', {
    part: 'snippet,contentDetails',
    id: videoId,
  });

  if (!data.items || data.items.length === 0) {
    throw new Error('Video not found');
  }

  const video = data.items[0];
  return {
    videoId: video.id,
    title: video.snippet.title,
    thumbnail: video.snippet.thumbnails.medium.url,
    channelName: video.snippet.channelTitle,
    channelId: video.snippet.channelId,
    duration: video.contentDetails.duration,
    publishedAt: video.snippet.publishedAt,
  };
}

// Get video info from URL
export async function getVideoFromUrl(url) {
  const videoId = extractVideoId(url);
  if (!videoId) {
    throw new Error('Invalid YouTube video URL');
  }

  return getVideoInfo(videoId);
}

// Get recent videos from a channel
export async function getChannelVideos(channelId, maxResults = 50) {
  const channelInfo = await getChannelById(channelId);
  const uploadsPlaylistId = channelInfo.uploadsPlaylistId;

  const data = await youtubeRequest('playlistItems', {
    part: 'snippet',
    playlistId: uploadsPlaylistId,
    maxResults,
  });

  const videoIds = data.items.map(item => item.snippet.resourceId.videoId);

  // Get detailed info for all videos
  const videosData = await youtubeRequest('videos', {
    part: 'snippet,contentDetails',
    id: videoIds.join(','),
  });

  return videosData.items.map(video => ({
    videoId: video.id,
    title: video.snippet.title,
    thumbnail: video.snippet.thumbnails.medium.url,
    channelName: video.snippet.channelTitle,
    duration: video.contentDetails.duration,
    publishedAt: video.snippet.publishedAt,
  }));
}
