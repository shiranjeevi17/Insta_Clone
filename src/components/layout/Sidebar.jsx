import { useContext, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import ConfirmDialog from '../common/ConfirmDialog';

export default function Sidebar() {
  const navigate = useNavigate();
  const { user, logout } = useContext(AuthContext);
  const [confirmingLogout, setConfirmingLogout] = useState(false);

  const navItems = [
    { path: '/', icon: '🏠', label: 'Home', end: true },
    { path: '/search', icon: '🔍', label: 'Search' },
    { path: '/explore', icon: '🌍', label: 'Explore' },
    { path: '/reels', icon: '🎬', label: 'Reels' },
    { path: '/messages', icon: '💬', label: 'Messages' },
    { path: '/notifications', icon: '❤️', label: 'Notifications' },
    { path: '/create', icon: '➕', label: 'Create' },
    { path: `/profile/${user?.username}`, icon: '👤', label: 'Profile' },
    { path: '/saved', icon: '🔖', label: 'Saved' },
    { path: '/settings', icon: '⚙️', label: 'Settings' },
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="sidebar-logo">InstaClone</div>
      </div>

      <nav className="sidebar-nav" aria-label="Main navigation">
        {navItems.map((item) => (
          <NavLink
            key={item.label}
            to={item.path}
            end={item.end}
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            <span className="nav-item-icon" aria-hidden="true">{item.icon}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-bottom">
        <button className="nav-item nav-item-logout" onClick={() => setConfirmingLogout(true)}>
          <span className="nav-item-icon" aria-hidden="true">🚪</span>
          <span>Logout</span>
        </button>
      </div>

      <ConfirmDialog
        isOpen={confirmingLogout}
        title="Log out?"
        message="You'll need to sign in again to access your account."
        confirmLabel="Log out"
        danger
        onCancel={() => setConfirmingLogout(false)}
        onConfirm={() => {
          logout();
          setConfirmingLogout(false);
          navigate('/login');
        }}
      />
    </aside>
  );
}
