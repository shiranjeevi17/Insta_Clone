export default function Spinner({ size = 32, inline = false, label = 'Loading' }) {
  return (
    <span
      className={`spinner ${inline ? 'spinner-inline' : ''}`}
      style={{ width: size, height: size }}
      role="status"
      aria-label={label}
    />
  );
}
