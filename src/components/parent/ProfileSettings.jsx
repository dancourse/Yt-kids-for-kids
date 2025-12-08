import { useState } from 'react';
import { api } from '../../lib/api';
import { AVATARS, SILLY_NAMES } from '../../lib/constants';

export default function ProfileSettings({ profile, onUpdate }) {
  const [avatarId, setAvatarId] = useState(profile.avatarId);
  const [sillyName, setSillyName] = useState(profile.sillyName);
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const data = { avatarId, sillyName };
      if (pin && pin.length === 4) {
        data.pin = pin;
      }

      await api.updateProfile(profile.id, data);
      setSuccess('Profile updated successfully!');
      setPin('');
      onUpdate();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Profile Settings</h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Avatar
          </label>
          <div className="grid grid-cols-4 gap-3">
            {AVATARS.map((avatar) => (
              <button
                key={avatar.id}
                type="button"
                onClick={() => setAvatarId(avatar.id)}
                className={`p-4 text-4xl rounded-lg border-2 transition hover:scale-110 ${
                  avatarId === avatar.id
                    ? 'border-primary bg-purple-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                {avatar.emoji}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label htmlFor="sillyName" className="block text-sm font-medium text-gray-700 mb-2">
            Silly Name
          </label>
          <select
            id="sillyName"
            value={sillyName}
            onChange={(e) => setSillyName(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            {SILLY_NAMES.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="pin" className="block text-sm font-medium text-gray-700 mb-2">
            PIN (4 digits)
          </label>
          <input
            id="pin"
            type="password"
            value={pin}
            onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
            maxLength={4}
            placeholder="Leave empty to keep current PIN"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          />
          <p className="text-sm text-gray-500 mt-1">
            {profile.pinHash ? 'PIN is currently set' : 'No PIN set yet'}
          </p>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}

        {success && (
          <div className="p-3 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm">
            {success}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-primary hover:bg-purple-600 text-white font-semibold py-3 rounded-lg transition disabled:opacity-50"
        >
          {loading ? 'Saving...' : 'Save Changes'}
        </button>
      </form>
    </div>
  );
}
