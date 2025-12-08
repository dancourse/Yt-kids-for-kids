import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ProfileCard from '../components/kids/ProfileCard';
import { PROFILE_IDS } from '../lib/constants';

export default function ProfileSelect() {
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadProfiles();
  }, []);

  const loadProfiles = async () => {
    try {
      // Load both profiles' public info
      const profilePromises = PROFILE_IDS.map(async (id) => {
        const response = await fetch(`/api/profiles-${id}-public`);
        if (response.ok) {
          return response.json();
        }
        return null;
      });

      const loadedProfiles = await Promise.all(profilePromises);
      setProfiles(loadedProfiles.filter(p => p !== null));
    } catch (error) {
      console.error('Failed to load profiles:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleProfileClick = (profile) => {
    navigate(`/watch/${profile.id}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-purple-100 to-pink-100 flex items-center justify-center">
        <div className="text-4xl font-bold text-primary">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-purple-100 to-pink-100 flex flex-col items-center justify-center p-8 relative overflow-hidden">
      {/* Decorative animated shapes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-32 h-32 bg-primary rounded-full opacity-20 animate-bounce-gentle" />
        <div className="absolute top-40 right-32 w-24 h-24 bg-secondary rounded-full opacity-20 animate-bounce-gentle" style={{ animationDelay: '0.5s' }} />
        <div className="absolute bottom-32 left-40 w-40 h-40 bg-accent rounded-full opacity-20 animate-bounce-gentle" style={{ animationDelay: '1s' }} />
        <div className="absolute bottom-20 right-20 w-28 h-28 bg-primary rounded-full opacity-20 animate-bounce-gentle" style={{ animationDelay: '1.5s' }} />
      </div>

      <div className="relative z-10 text-center mb-12">
        <h1 className="text-6xl font-bold text-primary mb-4 drop-shadow-lg">
          KiddoTube
        </h1>
        <p className="text-3xl font-semibold text-gray-700">
          Who's Watching?
        </p>
      </div>

      <div className="relative z-10 flex flex-wrap gap-8 justify-center">
        {profiles.map((profile) => (
          <ProfileCard
            key={profile.id}
            profile={profile}
            onClick={() => handleProfileClick(profile)}
          />
        ))}
      </div>
    </div>
  );
}
