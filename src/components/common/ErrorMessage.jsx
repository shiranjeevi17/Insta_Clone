export default function ErrorMessage({ title = 'Something went wrong', message, onRetry }) {
  return (
    <div className="empty-state error-state" role="alert">
      <div className="empty-state-icon" aria-hidden="true">⚠️</div>
      <h3>{title}</h3>
      {message && <p>{message}</p>}
      {onRetry && (
        <button className="btn btn-secondary btn-sm" onClick={onRetry}>
          Try again
        </button>
      )}
    </div>
  );
}
