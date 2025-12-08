import { useState, useEffect } from 'react';

export default function PinEntry({ profile, onSuccess, onBack }) {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (pin.length === 4) {
      handleSubmit();
    }
  }, [pin]);

  const handleSubmit = async () => {
    setError('');
    setLoading(true);

    try {
      await onSuccess(pin);
    } catch (err) {
      setError('Wrong PIN! Try again.');
      setPin('');

      // Shake animation on error
      const container = document.getElementById('pin-container');
      container?.classList.add('animate-shake');
      setTimeout(() => {
        container?.classList.remove('animate-shake');
      }, 500);
    } finally {
      setLoading(false);
    }
  };

  const handleNumberClick = (num) => {
    if (pin.length < 4) {
      setPin(pin + num);
    }
  };

  const handleBackspace = () => {
    setPin(pin.slice(0, -1));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-purple-100 to-pink-100 flex items-center justify-center p-4">
      <div id="pin-container" className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full">
        <button
          onClick={onBack}
          className="text-primary hover:text-purple-700 font-bold text-lg mb-6"
        >
          ← Back
        </button>

        <div className="text-center mb-8">
          <div className="text-7xl mb-4">{getAvatarEmoji(profile.avatarId)}</div>
          <h2 className="text-3xl font-bold text-gray-800 mb-2">{profile.sillyName}</h2>
          <p className="text-lg text-gray-600">Enter your PIN</p>
        </div>

        <div className="flex justify-center gap-3 mb-8">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className={`w-16 h-16 rounded-full flex items-center justify-center text-3xl font-bold border-4 transition ${
                pin.length > i
                  ? 'bg-primary border-primary text-white'
                  : 'bg-gray-100 border-gray-300 text-gray-400'
              }`}
            >
              {pin.length > i ? '●' : '○'}
            </div>
          ))}
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-100 border-2 border-red-300 text-red-700 rounded-xl text-center font-semibold">
            {error}
          </div>
        )}

        <div className="grid grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
            <button
              key={num}
              onClick={() => handleNumberClick(num.toString())}
              disabled={loading}
              className="aspect-square bg-gradient-to-br from-primary to-purple-600 hover:from-purple-600 hover:to-primary
                         text-white text-3xl font-bold rounded-2xl shadow-lg
                         transform transition-all duration-200 hover:scale-110 active:scale-95
                         disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {num}
            </button>
          ))}
          <div />
          <button
            onClick={() => handleNumberClick('0')}
            disabled={loading}
            className="aspect-square bg-gradient-to-br from-primary to-purple-600 hover:from-purple-600 hover:to-primary
                       text-white text-3xl font-bold rounded-2xl shadow-lg
                       transform transition-all duration-200 hover:scale-110 active:scale-95
                       disabled:opacity-50 disabled:cursor-not-allowed"
          >
            0
          </button>
          <button
            onClick={handleBackspace}
            disabled={loading || pin.length === 0}
            className="aspect-square bg-gray-200 hover:bg-gray-300 text-gray-700 text-2xl font-bold rounded-2xl
                       transform transition-all duration-200 hover:scale-110 active:scale-95
                       disabled:opacity-50 disabled:cursor-not-allowed"
          >
            ←
          </button>
        </div>
      </div>
    </div>
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
