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

  useEffect(() => {
    const savedUsername = localStorage.getItem('username') || '';
    const savedBio = localStorage.getItem('bio') || '';
    const savedGithub = localStorage.getItem('github') || '';
    const savedTwitter = localStorage.getItem('twitter') || '';

    setUsername(savedUsername);
    setBio(savedBio);
    setGithub(savedGithub);
    setTwitter(savedTwitter);
  }, []);

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