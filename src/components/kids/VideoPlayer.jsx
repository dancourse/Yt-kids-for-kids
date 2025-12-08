import { useEffect, useState } from 'react';

export default function VideoPlayer({ video, onBack, onWatchComplete }) {
  const [watchStartTime] = useState(Date.now());

  useEffect(() => {
    return () => {
      // Record watch duration when component unmounts
      const watchDuration = Math.floor((Date.now() - watchStartTime) / 1000);
      if (watchDuration > 5) { // Only record if watched for more than 5 seconds
        onWatchComplete(video.videoId, watchDuration, video.title);
      }
    };
  }, [video.videoId, watchStartTime, onWatchComplete]);

  return (
    <div className="min-h-screen bg-black">
      <div className="relative w-full h-screen">
        <button
          onClick={onBack}
          className="absolute top-4 left-4 z-50 bg-white bg-opacity-90 hover:bg-opacity-100
                     text-gray-800 font-bold px-6 py-3 rounded-full shadow-lg
                     transform transition-all duration-200 hover:scale-110"
        >
          ← Back to Videos
        </button>

        <iframe
          src={`https://www.youtube.com/embed/${video.videoId}?autoplay=1&rel=0&modestbranding=1`}
          title={video.title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="w-full h-full"
        />
      </div>
    </div>
  );
}
