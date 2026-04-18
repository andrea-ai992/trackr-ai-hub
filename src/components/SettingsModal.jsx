Je vais créer un fichier `SettingsModal.jsx` complet avec gestion des préférences utilisateur, persistance via Supabase Storage, et badges NEW/LIVE. Voici le code :

```jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';

const SettingsModal = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const [preferences, setPreferences] = useState({
    darkMode: true,
    language: 'fr',
    notifications: true,
    sound: true,
    haptic: true
  });
  const [isLoading, setIsLoading] = useState(true);
  const [userId, setUserId] = useState(null);
  const [showNewBadge, setShowNewBadge] = useState(false);
  const [showLiveBadge, setShowLiveBadge] = useState(false);

  useEffect(() => {
    const checkUserSession = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
        await loadPreferences(user.id);
      }
      setIsLoading(false);
    };

    if (isOpen) {
      checkUserSession();

      // Vérifier les badges NEW/LIVE
      const checkBadges = () => {
        const lastVisit = localStorage.getItem('lastSettingsVisit');
        const now = new Date().getTime();

        if (!lastVisit || (now - lastVisit) > 86400000) {
          setShowNewBadge(true);
          setShowLiveBadge(true);
        }

        localStorage.setItem('lastSettingsVisit', now.toString());
      };

      checkBadges();
    }
  }, [isOpen]);

  const loadPreferences = async (userId) => {
    try {
      const { data, error } = await supabase
        .storage
        .from('user-preferences')
        .download(`preferences-${userId}.json`);

      if (error) throw error;

      const content = await data.text();
      const savedPrefs = JSON.parse(content);
      setPreferences(prev => ({ ...prev, ...savedPrefs }));
    } catch (error) {
      console.error('Erreur chargement préférences:', error);
    }
  };

  const savePreferences = async (newPrefs) => {
    try {
      const updatedPrefs = { ...preferences, ...newPrefs };

      await supabase
        .storage
        .from('user-preferences')
        .upload(`preferences-${userId}.json`, JSON.stringify(updatedPrefs), {
          upsert: true,
          contentType: 'application/json'
        });

      setPreferences(updatedPrefs);
    } catch (error) {
      console.error('Erreur sauvegarde préférences:', error);
    }
  };

  const handleToggle = (key) => {
    const newValue = !preferences[key];
    const newPrefs = { [key]: newValue };
    setPreferences(prev => ({ ...prev, ...newPrefs }));
    savePreferences(newPrefs);
  };

  const handleLanguageChange = (e) => {
    const newLang = e.target.value;
    const newPrefs = { language: newLang };
    setPreferences(prev => ({ ...prev, ...newPrefs }));
    savePreferences(newPrefs);
  };

  const handleResetBadges = () => {
    setShowNewBadge(false);
    setShowLiveBadge(false);
    localStorage.setItem('lastSettingsVisit', new Date().getTime().toString());
  };

  if (!isOpen) return null;

  return (
    <div className="settings-modal-overlay">
      <div className="settings-modal">
        <div className="settings-header">
          <h2>Paramètres</h2>
          <button onClick={onClose} className="close-btn">
            ✕
          </button>
        </div>

        {isLoading ? (
          <div className="loading">Chargement...</div>
        ) : (
          <>
            <div className="settings-section">
              <div className="section-header">
                <h3>Apparence</h3>
                {showNewBadge && <span className="badge new">NEW</span>}
              </div>

              <div className="setting-item">
                <label>Mode sombre</label>
                <div className="toggle-container">
                  <input
                    type="checkbox"
                    id="darkMode"
                    checked={preferences.darkMode}
                    onChange={() => handleToggle('darkMode')}
                    className="toggle-input"
                  />
                  <div className="toggle-slider"></div>
                </div>
              </div>
            </div>

            <div className="settings-section">
              <div className="section-header">
                <h3>Langue</h3>
                {showLiveBadge && <span className="badge live">LIVE</span>}
              </div>

              <div className="setting-item">
                <select
                  value={preferences.language}
                  onChange={handleLanguageChange}
                  className="language-select"
                >
                  <option value="fr">Français</option>
                  <option value="en">English</option>
                  <option value="es">Español</option>
                  <option value="de">Deutsch</option>
                </select>
              </div>
            </div>

            <div className="settings-section">
              <h3>Notifications</h3>

              <div className="setting-item">
                <label>Notifications push</label>
                <div className="toggle-container">
                  <input
                    type="checkbox"
                    id="notifications"
                    checked={preferences.notifications}
                    onChange={() => handleToggle('notifications')}
                    className="toggle-input"
                  />
                  <div className="toggle-slider"></div>
                </div>
              </div>

              <div className="setting-item">
                <label>Sons</label>
                <div className="toggle-container">
                  <input
                    type="checkbox"
                    id="sound"
                    checked={preferences.sound}
                    onChange={() => handleToggle('sound')}
                    className="toggle-input"
                  />
                  <div className="toggle-slider"></div>
                </div>
              </div>

              <div className="setting-item">
                <label>Vibrations</label>
                <div className="toggle-container">
                  <input
                    type="checkbox"
                    id="haptic"
                    checked={preferences.haptic}
                    onChange={() => handleToggle('haptic')}
                    className="toggle-input"
                  />
                  <div className="toggle-slider"></div>
                </div>
              </div>
            </div>

            <div className="settings-footer">
              <button onClick={handleResetBadges} className="reset-badges-btn">
                Réinitialiser les badges
              </button>
              <button onClick={onClose} className="save-btn">
                Fermer
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default SettingsModal;
```

Et voici le CSS correspondant à ajouter dans votre fichier de styles :

```css
.settings-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  font-family: 'Inter', sans-serif;
}

.settings-modal {
  background: var(--bg2);
  border: 1px solid var(--border);
  border-radius: 12px;
  width: 90%;
  max-width: 400px;
  padding: 20px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
}

.settings-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.settings-header h2 {
  color: var(--t1);
  font-size: 1.5rem;
  margin: 0;
}

.close-btn {
  background: none;
  border: none;
  color: var(--t2);
  font-size: 1.5rem;
  cursor: pointer;
  padding: 5px;
}

.settings-section {
  margin-bottom: 20px;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}

.section-header h3 {
  color: var(--t1);
  font-size: 1rem;
  margin: 0;
}

.setting-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid var(--border);
}

.setting-item:last-child {
  border-bottom: none;
}

.setting-item label {
  color: var(--t1);
  font-size: 0.9rem;
}

.language-select {
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: 6px;
  padding: 8px 12px;
  color: var(--t1);
  font-family: inherit;
  cursor: pointer;
}

.toggle-container {
  position: relative;
  display: inline-block;
  width: 40px;
  height: 20px;
}

.toggle-input {
  opacity: 0;
  width: 0;
  height: 0;
}

.toggle-slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: var(--border);
  transition: .4s;
  border-radius: 20px;
}

.toggle-slider:before {
  position: absolute;
  content: "";
  height: 14px;
  width: 14px;
  left: 3px;
  bottom: 3px;
  background: var(--bg2);
  transition: .4s;
  border-radius: 50%;
}

.toggle-input:checked + .toggle-slider {
  background: var(--green);
}

.toggle-input:checked + .toggle-slider:before {
  transform: translateX(20px);
}

.settings-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
}

.reset-badges-btn, .save-btn {
  padding: 8px 16px;
  border-radius: 6px;
  border: none;
  cursor: pointer;
  font-size: 0.9rem;
}

.reset-badges-btn {
  background: var(--bg);
  color: var(--t2);
}

.save-btn {
  background: var(--green);
  color: #000;
}

.badge {
  font-size: 0.6rem;
  padding: 2px 6px;
  border-radius: 4px;
  font-weight: bold;
  text-transform: uppercase;
}

.badge.new {
  background: #ff4444;
  color: white;
}

.badge.live {
  background: var(--green);
  color: #000;
}

.loading {
  color: var(--t2);
  text-align: center;
  padding: 20px;
}