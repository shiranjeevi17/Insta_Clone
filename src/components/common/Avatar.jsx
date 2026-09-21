import { initials } from '../../utils/format';

const SIZES = { xs: 28, sm: 32, md: 40, lg: 56, xl: 86, xxl: 110 };

export default function Avatar({ src, name = '', size = 'md', ring = false, alt }) {
  const px = SIZES[size] || SIZES.md;
  const label = alt || (name ? `${name}'s profile picture` : 'Profile picture');

  return (
    <div
      className={`avatar ${ring ? 'avatar-ring' : ''}`}
      style={{ width: px, height: px, fontSize: Math.max(12, px * 0.4) }}
    >
      {src ? (
        <img src={src} alt={label} onError={(e) => { e.currentTarget.style.display = 'none'; }} />
      ) : (
        <span aria-hidden="true">{initials(name)}</span>
      )}
    </div>
  );
}
