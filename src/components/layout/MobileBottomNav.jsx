import { useContext } from 'react';
import { NavLink } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import Avatar from '../common/Avatar';

export default function MobileBottomNav() {
  const { user } = useContext(AuthContext);

  return (
    <nav className="mobile-bottom-nav" aria-label="Primary">
      <NavLink to="/" end className={({ isActive }) => `nav-btn ${isActive ? 'active' : ''}`} aria-label="Home">
        🏠
      </NavLink>
      <NavLink to="/search" className={({ isActive }) => `nav-btn ${isActive ? 'active' : ''}`} aria-label="Search">
        🔍
      </NavLink>
      <NavLink to="/create" className={({ isActive }) => `nav-btn create-btn ${isActive ? 'active' : ''}`} aria-label="Create post">
        ➕
      </NavLink>
      <NavLink to="/reels" className={({ isActive }) => `nav-btn ${isActive ? 'active' : ''}`} aria-label="Reels">
        🎬
      </NavLink>
      <NavLink
        to={`/profile/${user?.username}`}
        className={({ isActive }) => `nav-btn ${isActive ? 'active' : ''}`}
        aria-label="Your profile"
      >
        <Avatar src={user?.avatar} name={user?.fullName || user?.username} size="xs" />
      </NavLink>
    </nav>
  );
}
