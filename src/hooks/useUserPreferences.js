Je vais créer le hook `useUserPreferences.js` et modifier `SettingsModal.jsx` pour intégrer le système de gestion des préférences utilisateur avec persistance via Supabase Storage.

```javascript
// src/hooks/useUserPreferences.js
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

const PREFERENCES_KEY = 'user_preferences';
const DEFAULT_PREFERENCES = {
  theme: 'dark',
  language: 'en',
  notifications: true,
  lastUpdated: null
};

export const useUserPreferences = () => {
  const [preferences, setPreferences] = useState(DEFAULT_PREFERENCES);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadPreferences = async () => {
    try {
      setLoading(true);
      setError(null);

      // Récupérer les préférences depuis Supabase Storage
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;

      if (userData?.user) {
        const { data: storageData, error: storageError } = await supabase
          .storage
          .from('user-data')
          .download(`${userData.user.id}/${PREFERENCES_KEY}.json`);

        if (storageError && storageError.status !== 404) throw storageError;

        if (storageData) {
          const preferencesData = JSON.parse(await storageData.text());
          setPreferences(prev => ({ ...prev, ...preferencesData }));
        }
      }
    } catch (err) {
      console.error('Error loading preferences:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const savePreferences = async (newPreferences) => {
    try {
      setLoading(true);
      setError(null);

      const updatedPreferences = { ...preferences, ...newPreferences, lastUpdated: new Date().toISOString() };
      setPreferences(updatedPreferences);

      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;

      if (userData?.user) {
        const { error: uploadError } = await supabase
          .storage
          .from('user-data')
          .upload(
            `${userData.user.id}/${PREFERENCES_KEY}.json`,
            JSON.stringify(updatedPreferences),
            { upsert: true }
          );

        if (uploadError) throw uploadError;
      }
    } catch (err) {
      console.error('Error saving preferences:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const updateTheme = (theme) => {
    savePreferences({ theme });
    document.documentElement.setAttribute('data-theme', theme);
  };

  const updateLanguage = (language) => {
    savePreferences({ language });
  };

  const toggleNotifications = () => {
    savePreferences({ notifications: !preferences.notifications });
  };

  useEffect(() => {
    loadPreferences();
  }, []);

  useEffect(() => {
    // Appliquer le thème
    document.documentElement.setAttribute('data-theme', preferences.theme);
  }, [preferences.theme]);

  return {
    preferences,
    loading,
    error,
    updateTheme,
    updateLanguage,
    toggleNotifications,
    savePreferences
  };
};
```

```javascript
// src/components/SettingsModal.jsx
import { useState } from 'react';
import { useUserPreferences } from '../hooks/useUserPreferences';
import { Settings, Check, X, Moon, Sun, Globe, Bell, BellOff } from 'lucide-react';

const SettingsModal = ({ isOpen, onClose }) => {
  const {
    preferences,
    loading,
    error,
    updateTheme,
    updateLanguage,
    toggleNotifications
  } = useUserPreferences();

  const [activeTab, setActiveTab] = useState('general');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
      <div className="w-full max-w-md mx-4 bg-bg2 rounded-2xl border border-border p-6 relative">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-t1 flex items-center gap-2">
            <Settings size={20} />
            Settings
            <span className="text-xs bg-green text-bg px-2 py-1 rounded-full">NEW</span>
          </h2>
          <button
            onClick={onClose}
            className="text-t2 hover:text-t1 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="flex border-b border-border mb-6">
          <button
            onClick={() => setActiveTab('general')}
            className={`px-4 py-2 text-sm font-medium ${activeTab === 'general' ? 'text-green border-b-2 border-green' : 'text-t2'}`}
          >
            General
          </button>
          <button
            onClick={() => setActiveTab('notifications')}
            className={`px-4 py-2 text-sm font-medium ${activeTab === 'notifications' ? 'text-green border-b-2 border-green' : 'text-t2'}`}
          >
            Notifications
            <span className="ml-2 bg-green text-bg px-2 py-1 rounded-full text-xs">LIVE</span>
          </button>
        </div>

        {activeTab === 'general' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-t1 font-medium mb-3">Theme</h3>
              <div className="flex gap-2">
                <button
                  onClick={() => updateTheme('dark')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg ${preferences.theme === 'dark' ? 'bg-bg3 border border-border' : 'hover:bg-bg3'}`}
                >
                  <Moon size={16} />
                  <span>Dark</span>
                  {preferences.theme === 'dark' && <Check size={16} className="text-green" />}
                </button>
                <button
                  onClick={() => updateTheme('light')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg ${preferences.theme === 'light' ? 'bg-bg3 border border-border' : 'hover:bg-bg3'}`}
                >
                  <Sun size={16} />
                  <span>Light</span>
                  {preferences.theme === 'light' && <Check size={16} className="text-green" />}
                </button>
              </div>
            </div>

            <div>
              <h3 className="text-t1 font-medium mb-3">Language</h3>
              <select
                value={preferences.language}
                onChange={(e) => updateLanguage(e.target.value)}
                className="w-full bg-bg3 border border-border rounded-lg px-4 py-2 text-t1 focus:outline-none focus:border-green transition-colors"
              >
                <option value="en">English</option>
                <option value="fr">Français</option>
                <option value="es">Español</option>
              </select>
            </div>
          </div>
        )}

        {activeTab === 'notifications' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-t1 font-medium">Enable Notifications</h3>
                <p className="text-t3 text-sm">Receive alerts for new features and updates</p>
              </div>
              <button
                onClick={toggleNotifications}
                className="p-2 rounded-full bg-bg3 hover:bg-bg transition-colors"
              >
                {preferences.notifications ? (
                  <Bell size={20} className="text-green" />
                ) : (
                  <BellOff size={20} className="text-t2" />
                )}
              </button>
            </div>
          </div>
        )}

        {error && (
          <div className="mt-4 p-3 bg-red-900/20 border border-red-500/30 rounded-lg text-red-400 text-sm">
            {error}
          </div>
        )}
      </div>
    </div>
  );
};

export default SettingsModal;