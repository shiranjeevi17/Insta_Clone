export function SkeletonPostCard() {
  return (
    <div className="post-card skeleton-card" aria-hidden="true">
      <div className="post-header">
        <div className="skeleton skeleton-circle" style={{ width: 40, height: 40 }} />
        <div style={{ flex: 1, marginLeft: '0.75rem' }}>
          <div className="skeleton skeleton-line" style={{ width: '35%' }} />
          <div className="skeleton skeleton-line" style={{ width: '20%', marginTop: 6 }} />
        </div>
      </div>
      <div className="skeleton" style={{ width: '100%', aspectRatio: '1', borderRadius: 0 }} />
      <div style={{ padding: '0.75rem 1rem' }}>
        <div className="skeleton skeleton-line" style={{ width: '60%' }} />
        <div className="skeleton skeleton-line" style={{ width: '40%', marginTop: 8 }} />
      </div>
    </div>
  );
}

export function SkeletonGrid({ count = 6 }) {
  return (
    <div className="grid-3" aria-hidden="true">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="skeleton" style={{ aspectRatio: '1', borderRadius: 'var(--radius-md)' }} />
      ))}
    </div>
  );
}

export function SkeletonStories({ count = 6 }) {
  return (
    <div className="stories-container" aria-hidden="true">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="story">
          <div className="skeleton skeleton-circle" style={{ width: 56, height: 56 }} />
          <div className="skeleton skeleton-line" style={{ width: 40, marginTop: 6 }} />
        </div>
      ))}
    </div>
  );
}

export function SkeletonList({ count = 4 }) {
  return (
    <div aria-hidden="true">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="skeleton-row">
          <div className="skeleton skeleton-circle" style={{ width: 44, height: 44 }} />
          <div style={{ flex: 1 }}>
            <div className="skeleton skeleton-line" style={{ width: '50%' }} />
            <div className="skeleton skeleton-line" style={{ width: '30%', marginTop: 6 }} />
          </div>
        </div>
      ))}
    </div>
  );
}
