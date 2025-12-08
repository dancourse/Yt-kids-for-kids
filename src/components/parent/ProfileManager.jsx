import { useState } from 'react';
import ProfileSettings from './ProfileSettings';
import CreatorManager from './CreatorManager';
import VideoManager from './VideoManager';
import WatchHistory from './WatchHistory';

export default function ProfileManager({ profile, onBack, onUpdate }) {
  const [activeTab, setActiveTab] = useState('settings');

  const tabs = [
    { id: 'settings', label: 'Profile Settings' },
    { id: 'creators', label: 'Approved Creators' },
    { id: 'videos', label: 'Approved Videos' },
    { id: 'history', label: 'Watch History' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <button
            onClick={onBack}
            className="mb-4 text-primary hover:text-purple-700 font-medium"
          >
            ← Back to Dashboard
          </button>
          <div className="flex items-center space-x-4">
            <div className="text-5xl">{getAvatarEmoji(profile.avatarId)}</div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{profile.sillyName}</h1>
              <p className="text-gray-500">{profile.id}</p>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="border-b border-gray-200 bg-white mt-6 rounded-t-lg">
          <nav className="flex space-x-8 px-6" aria-label="Tabs">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition ${
                  activeTab === tab.id
                    ? 'border-primary text-primary'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="bg-white rounded-b-lg shadow p-6 mb-8">
          {activeTab === 'settings' && (
            <ProfileSettings profile={profile} onUpdate={onUpdate} />
          )}
          {activeTab === 'creators' && (
            <CreatorManager profileId={profile.id} />
          )}
          {activeTab === 'videos' && (
            <VideoManager profileId={profile.id} />
          )}
          {activeTab === 'history' && (
            <WatchHistory profileId={profile.id} />
          )}
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
