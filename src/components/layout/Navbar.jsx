import { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { AppContext } from '../../context/AppContext';
import { ThemeContext } from '../../context/ThemeContext';
import Avatar from '../common/Avatar';

export default function Navbar() {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const { getMyNotifications } = useContext(AppContext);
  const { toggleTheme, isDark } = useContext(ThemeContext);
  const [searchQuery, setSearchQuery] = useState('');

  const unreadCount = getMyNotifications().filter((n) => !n.read).length;

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header className="navbar">
      <div className="navbar-container">
        <button className="navbar-logo" onClick={() => navigate('/')} aria-label="InstaClone home">
          InstaClone
        </button>

        <form onSubmit={handleSearch} className="navbar-search" role="search">
          <label htmlFor="navbar-search-input" className="sr-only">Search users, posts</label>
          <input
            id="navbar-search-input"
            type="search"
            placeholder="Search users, posts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </form>

        <nav className="navbar-icons" aria-label="Primary">
          <button className="navbar-icon" onClick={toggleTheme} title="Toggle theme" aria-label="Toggle light/dark theme">
            {isDark ? '☀️' : '🌙'}
          </button>
          <button
            className="navbar-icon"
            onClick={() => navigate('/notifications')}
            title="Notifications"
            aria-label={`Notifications${unreadCount ? `, ${unreadCount} unread` : ''}`}
          >
            ❤️
            {unreadCount > 0 && <span className="notification-badge">{unreadCount > 9 ? '9+' : unreadCount}</span>}
          </button>
          <button className="navbar-icon" onClick={() => navigate('/messages')} title="Messages" aria-label="Messages">
            💬
          </button>
          <button
            className="navbar-icon navbar-avatar-btn"
            onClick={() => navigate(`/profile/${user?.username}`)}
            title="Profile"
            aria-label="Your profile"
          >
            <Avatar src={user?.avatar} name={user?.fullName || user?.username} size="xs" />
          </button>
        </nav>
      </div>
    </header>
  );
}
