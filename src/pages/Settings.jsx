import { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { ThemeContext } from '../context/ThemeContext';
import { ToastContext } from '../context/ToastContext';
import { clearAppStorage, STORAGE_KEYS, removeStorage } from '../utils/storage';
import Layout from '../components/layout/Layout';
import ConfirmDialog from '../components/common/ConfirmDialog';

export default function Settings() {
  const navigate = useNavigate();
  const { logout } = useContext(AuthContext);
  const { theme, toggleTheme } = useContext(ThemeContext);
  const { showToast } = useContext(ToastContext) || {};

  const [confirmLogout, setConfirmLogout] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);
  const [privateAccount, setPrivateAccount] = useState(false);
  const [allowComments, setAllowComments] = useState(true);
  const [notifyLikes, setNotifyLikes] = useState(true);
  const [notifyComments, setNotifyComments] = useState(true);
  const [notifyFollows, setNotifyFollows] = useState(true);

  const handleLogout = () => {
    logout();
    setConfirmLogout(false);
    navigate('/login');
  };

  const handleClearData = () => {
    // Keep the account/session itself; only clear app content so the demo
    // stays usable instead of removing the account/session itself.
    [
      STORAGE_KEYS.POSTS, STORAGE_KEYS.STORIES, STORAGE_KEYS.STORY_VIEWS,
      STORAGE_KEYS.REELS, STORAGE_KEYS.SAVES, STORAGE_KEYS.NOTIFICATIONS,
      STORAGE_KEYS.MESSAGES, STORAGE_KEYS.SEEDED,
    ].forEach(removeStorage);
    setConfirmClear(false);
    showToast?.('App data cleared. Reloading…', { type: 'success' });
    setTimeout(() => window.location.reload(), 800);
  };

  return (
    <Layout>
      <div className="page-narrow">
        <h2>Settings</h2>

        <section className="card settings-card">
          <h3>Appearance</h3>
          <div className="settings-row">
            <div>
              <p>Dark Mode</p>
              <span className="text-secondary">Current: {theme === 'dark' ? 'Dark' : 'Light'} mode</span>
            </div>
            <button className="btn btn-secondary btn-sm" onClick={toggleTheme}>
              {theme === 'dark' ? '☀️ Light Mode' : '🌙 Dark Mode'}
            </button>
          </div>
        </section>

        <section className="card settings-card">
          <h3>Privacy & Security</h3>
          <label className="settings-row settings-toggle-row">
            <span>Private Account</span>
            <input type="checkbox" checked={privateAccount} onChange={(e) => setPrivateAccount(e.target.checked)} />
          </label>
          <label className="settings-row settings-toggle-row">
            <span>Allow comments on my posts</span>
            <input type="checkbox" checked={allowComments} onChange={(e) => setAllowComments(e.target.checked)} />
          </label>
        </section>

        <section className="card settings-card">
          <h3>Notifications</h3>
          <label className="settings-row settings-toggle-row">
            <span>Likes</span>
            <input type="checkbox" checked={notifyLikes} onChange={(e) => setNotifyLikes(e.target.checked)} />
          </label>
          <label className="settings-row settings-toggle-row">
            <span>Comments</span>
            <input type="checkbox" checked={notifyComments} onChange={(e) => setNotifyComments(e.target.checked)} />
          </label>
          <label className="settings-row settings-toggle-row">
            <span>New followers</span>
            <input type="checkbox" checked={notifyFollows} onChange={(e) => setNotifyFollows(e.target.checked)} />
          </label>
        </section>

        <section className="card settings-card">
          <h3>Data Management</h3>
          <p className="text-secondary" style={{ marginBottom: '0.75rem' }}>
            This is a frontend-only demo — everything lives in your browser's IndexedDB storage.
          </p>
          <button className="btn btn-danger btn-block" onClick={() => setConfirmClear(true)}>
            Clear All App Data
          </button>
        </section>

        <section className="card settings-card">
          <h3>Session</h3>
          <button className="btn btn-danger btn-block" onClick={() => setConfirmLogout(true)}>
            Logout
          </button>
        </section>
      </div>

      <ConfirmDialog
        isOpen={confirmLogout}
        title="Log out?"
        message="You'll need to sign in again to access your account."
        confirmLabel="Log out"
        danger
        onCancel={() => setConfirmLogout(false)}
        onConfirm={handleLogout}
      />
      <ConfirmDialog
        isOpen={confirmClear}
        title="Clear all app data?"
        message="This removes posts, stories, reels, messages and notifications stored in this browser. This can't be undone."
        confirmLabel="Clear data"
        danger
        onCancel={() => setConfirmClear(false)}
        onConfirm={handleClearData}
      />
    </Layout>
  );
}
