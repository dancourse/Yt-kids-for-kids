export default function ProfileCard({ profile, onClick }) {
  return (
    <button
      onClick={onClick}
      className="group bg-white rounded-3xl shadow-lg p-8 w-64 h-80 flex flex-col items-center justify-center
                 transform transition-all duration-300 hover:scale-110 hover:rotate-3 hover:shadow-2xl
                 border-4 border-transparent hover:border-primary"
    >
      <div className="text-8xl mb-4 transform transition-all duration-300 group-hover:animate-bounce-gentle">
        {getAvatarEmoji(profile.avatarId)}
      </div>
      <h2 className="text-3xl font-bold text-gray-800 text-center group-hover:text-primary transition">
        {profile.sillyName}
      </h2>
    </button>
  );
}

function getAvatarEmoji(avatarId) {
  const avatars = {
    rocket: '🚀',
    dinosaur: '🦕',
    rainbow: '🌈',
    robot: '🤖',
    unicorn: '🦄',
    astronaut: '👨‍🚀',
    dragon: '🐉',
    penguin: '🐧',
  };
  return avatars[avatarId] || '👤';
}
