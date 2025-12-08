export default function VideoCard({ video, onClick }) {
  return (
    <button
      onClick={onClick}
      className="group bg-white rounded-2xl shadow-lg overflow-hidden
                 transform transition-all duration-300 hover:scale-105 hover:shadow-2xl
                 border-4 border-transparent hover:border-secondary"
    >
      <div className="relative aspect-video">
        <img
          src={video.thumbnail}
          alt={video.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition flex items-center justify-center">
          <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center transform scale-0 group-hover:scale-100 transition-transform duration-300">
            <div className="w-0 h-0 border-t-8 border-t-transparent border-l-12 border-l-primary border-b-8 border-b-transparent ml-1" />
          </div>
        </div>
        {video.duration && (
          <div className="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded">
            {formatDuration(video.duration)}
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-bold text-gray-900 text-left line-clamp-2 mb-1 group-hover:text-primary transition">
          {video.title}
        </h3>
        <p className="text-sm text-gray-600 text-left">{video.channelName}</p>
      </div>
    </button>
  );
}

function formatDuration(duration) {
  // Parse ISO 8601 duration (PT#M#S format)
  const match = duration.match(/PT(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return '';

  const minutes = match[1] || '0';
  const seconds = match[2] || '0';

  if (parseInt(minutes) > 0) {
    return `${minutes}:${seconds.padStart(2, '0')}`;
  }
  return `0:${seconds.padStart(2, '0')}`;
}
