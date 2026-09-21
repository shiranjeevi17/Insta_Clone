import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="status-page">
      <div className="status-page-emoji" aria-hidden="true">🧭</div>
      <h1>404</h1>
      <p>This page doesn't exist. It may have been moved or removed.</p>
      <Link to="/" className="btn btn-primary">
        Back Home
      </Link>
    </div>
  );
}
