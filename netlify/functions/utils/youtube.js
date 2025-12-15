// YouTube API helpers

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;

// Extract YouTube video ID from various URL formats
export function extractVideoId(url) {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/v\/([a-zA-Z0-9_-]{11})/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }

  // If it's already just an ID
  if (/^[a-zA-Z0-9_-]{11}$/.test(url)) {
    return url;
  }

  return null;
}

// Extract YouTube channel ID or handle from URL
export function extractChannelInfo(url) {
  // Handle format: @username
  const handleMatch = url.match(/youtube\.com\/@([a-zA-Z0-9_-]+)/);
  if (handleMatch) {
    return { type: 'handle', value: handleMatch[1] };
  }

  // Channel ID format
  const channelMatch = url.match(/youtube\.com\/channel\/([a-zA-Z0-9_-]+)/);
  if (channelMatch) {
    return { type: 'channelId', value: channelMatch[1] };
  }

  // User format (old style)
  const userMatch = url.match(/youtube\.com\/user\/([a-zA-Z0-9_-]+)/);
  if (userMatch) {
    return { type: 'user', value: userMatch[1] };
  }

  // If it looks like a channel ID
  if (/^UC[a-zA-Z0-9_-]{22}$/.test(url)) {
    return { type: 'channelId', value: url };
  }

  return null;
}

// Fetch video metadata from YouTube API
export async function getVideoInfo(videoId) {
  if (!YOUTUBE_API_KEY) {
    throw new Error('YouTube API key not configured');
  }

  const url = `https://www.googleapis.com/youtube/v3/videos?id=${videoId}&part=snippet&key=${YOUTUBE_API_KEY}`;
  
  const response = await fetch(url);
  const data = await response.json();

  if (data.error) {
    throw new Error(data.error.message || 'YouTube API error');
  }

  if (!data.items || data.items.length === 0) {
    throw new Error('Video not found');
  }

  const video = data.items[0];
  return {
    videoId: video.id,
    videoTitle: video.snippet.title,
    videoThumbnail: video.snippet.thumbnails.high?.url || video.snippet.thumbnails.default.url,
    videoDescription: video.snippet.description,
    channelTitle: video.snippet.channelTitle,
    channelId: video.snippet.channelId,
  };
}

// Fetch channel metadata from YouTube API
export async function getChannelInfo(channelInfo) {
  if (!YOUTUBE_API_KEY) {
    throw new Error('YouTube API key not configured');
  }

  let url;
  if (channelInfo.type === 'channelId') {
    url = `https://www.googleapis.com/youtube/v3/channels?id=${channelInfo.value}&part=snippet&key=${YOUTUBE_API_KEY}`;
  } else if (channelInfo.type === 'handle') {
    url = `https://www.googleapis.com/youtube/v3/channels?forHandle=${channelInfo.value}&part=snippet&key=${YOUTUBE_API_KEY}`;
  } else if (channelInfo.type === 'user') {
    url = `https://www.googleapis.com/youtube/v3/channels?forUsername=${channelInfo.value}&part=snippet&key=${YOUTUBE_API_KEY}`;
  }

  const response = await fetch(url);
  const data = await response.json();

  if (data.error) {
    throw new Error(data.error.message || 'YouTube API error');
  }

  if (!data.items || data.items.length === 0) {
    throw new Error('Channel not found');
  }

  const channel = data.items[0];
  return {
    channelId: channel.id,
    channelTitle: channel.snippet.title,
    channelThumbnail: channel.snippet.thumbnails.high?.url || channel.snippet.thumbnails.default.url,
    channelDescription: channel.snippet.description,
  };
}
