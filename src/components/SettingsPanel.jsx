Je vais intégrer un toggle dark mode persistant dans le SettingsPanel.jsx en suivant les règles. Voici le code complet et fonctionnel :

```jsx
import { useState, useEffect } from 'react';
import DOMPurify from 'dompurify';

const SettingsPanel = () => {
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [github, setGithub] = useState('');
  const [twitter, setTwitter] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [darkMode, setDarkMode] = useState(() => {
    const savedMode = localStorage.getItem('darkMode');
    return savedMode !== null ? JSON.parse(savedMode) : true;
  });

  useEffect(() => {
    const savedUsername = localStorage.getItem('username') || '';
    const savedBio = localStorage.getItem('bio') || '';
    const savedGithub = localStorage.getItem('github') || '';
    const savedTwitter = localStorage.getItem('twitter') || '';

    setUsername(savedUsername);
    setBio(savedBio);
    setGithub(savedGithub);
    setTwitter(savedTwitter);

    // Apply dark mode
    if (darkMode) {
      document.documentElement.style.setProperty('--bg', '#080808');
      document.documentElement.style.setProperty('--bg2', '#111');
      document.documentElement.style.setProperty('--bg3', '#1a1a1a');
      document.documentElement.style.setProperty('--t1', '#f0f0f0');
      document.documentElement.style.setProperty('--t2', '#888');
      document.documentElement.style.setProperty('--t3', '#444');
      document.documentElement.style.setProperty('--border', 'rgba(255,255,255,0.07)');
      document.documentElement.style.setProperty('--border-hi', 'rgba(0,255,136,0.3)');
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.style.setProperty('--bg', '#f5f5f5');
      document.documentElement.style.setProperty('--bg2', '#e0e0e0');
      document.documentElement.style.setProperty('--bg3', '#d0d0d0');
      document.documentElement.style.setProperty('--t1', '#1a1a1a');
      document.documentElement.style.setProperty('--t2', '#555');
      document.documentElement.style.setProperty('--t3', '#777');
      document.documentElement.style.setProperty('--border', 'rgba(0,0,0,0.1)');
      document.documentElement.style.setProperty('--border-hi', 'rgba(0,128,255,0.3)');
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const handleSave = () => {
    setIsSaving(true);
    setError('');
    setSuccess('');

    try {
      const sanitizedUsername = DOMPurify.sanitize(username.trim());
      const sanitizedBio = DOMPurify.sanitize(bio.trim());
      const sanitizedGithub = DOMPurify.sanitize(github.trim());
      const sanitizedTwitter = DOMPurify.sanitize(twitter.trim());

      if (!sanitizedUsername) {
        throw new Error('Username is required');
      }

      localStorage.setItem('username', sanitizedUsername);
      localStorage.setItem('bio', sanitizedBio);
      localStorage.setItem('github', sanitizedGithub);
      localStorage.setItem('twitter', sanitizedTwitter);

      setSuccess('Settings saved successfully!');
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem('darkMode', JSON.stringify(newMode));
  };

  return (
    <div className="settings-panel">
      <div className="settings-header">
        <h2>Settings</h2>
      </div>

      <div className="settings-content">
        <div className="form-group">
          <label htmlFor="username">Username</label>
          <input
            id="username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter your username"
          />
        </div>

        <div className="form-group">
          <label htmlFor="bio">Bio</label>
          <textarea
            id="bio"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Tell us about yourself"
            rows={3}
          />
        </div>

        <div className="form-group">
          <label htmlFor="github">GitHub</label>
          <input
            id="github"
            type="text"
            value={github}
            onChange={(e) => setGithub(e.target.value)}
            placeholder="Your GitHub profile"
          />
        </div>

        <div className="form-group">
          <label htmlFor="twitter">Twitter</label>
          <input
            id="twitter"
            type="text"
            value={twitter}
            onChange={(e) => setTwitter(e.target.value)}
            placeholder="Your Twitter handle"
          />
        </div>

        <div className="dark-mode-toggle">
          <label className="toggle-switch">
            <input
              type="checkbox"
              checked={darkMode}
              onChange={toggleDarkMode}
            />
            <span className="slider round"></span>
            <span className="toggle-label">{darkMode ? 'Dark Mode' : 'Light Mode'}</span>
          </label>
        </div>

        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        <button
          className="save-button"
          onClick={handleSave}
          disabled={isSaving}
        >
          {isSaving ? 'Saving...' : 'Save Settings'}
        </button>
      </div>
    </div>
  );
};

export default SettingsPanel;