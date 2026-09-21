import { useContext, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { AppContext } from '../../context/AppContext';
import Avatar from '../common/Avatar';
import Spinner from '../common/Spinner';
import { formatCount, timeAgo } from '../../utils/format';

export default function ReelCard({ reel, active }) {
  const { user, getUserById, toggleFollow, isFollowing } = useContext(AuthContext);
  const { toggleReelLike, addReelComment } = useContext(AppContext);

  const videoRef = useRef(null);
  const [muted, setMuted] = useState(true);
  const [paused, setPaused] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');

  const author = getUserById(reel.userId);
  const liked = reel.likes.includes(user.id);
  const following = isFollowing(reel.userId);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (active && !paused) {
      video.play().catch(() => {});
    } else {
      video.pause();
    }
  }, [active, paused]);

  if (!author) return null;

  return (
    <div className="reel-card">
      <div className="reel-video-wrap" onClick={() => setPaused((p) => !p)}>
        {loading && !error && (
          <div className="reel-loading">
            <Spinner size={36} />
          </div>
        )}
        {error ? (
          <div className="media-broken reel-error">
            <span aria-hidden="true">🎬</span>
            <p>This video couldn't be loaded</p>
          </div>
        ) : (
          <video
            ref={videoRef}
            src={reel.video}
            loop
            muted={muted}
            playsInline
            preload="metadata"
            onCanPlay={() => setLoading(false)}
            onError={() => {
              setLoading(false);
              setError(true);
            }}
          />
        )}
        {paused && !loading && !error && (
          <div className="reel-play-indicator" aria-hidden="true">▶️</div>
        )}
      </div>

      <div className="reel-info">
        <div className="reel-user-row">
          <Link to={`/profile/${author.username}`} className="reel-user">
            <Avatar src={author.avatar} name={author.fullName} size="sm" />
            <span>{author.username}</span>
          </Link>
          {author.id !== user.id && (
            <button
              className={`btn btn-sm ${following ? 'btn-secondary' : 'btn-outline-light'}`}
              onClick={() => toggleFollow(author.id)}
            >
              {following ? 'Following' : 'Follow'}
            </button>
          )}
        </div>
        {reel.caption && <p className="reel-caption">{reel.caption}</p>}
        <span className="reel-timestamp">{timeAgo(reel.timestamp)}</span>
      </div>

      <div className="reel-actions">
        <button
          className={`reel-action-btn ${liked ? 'liked' : ''}`}
          onClick={() => toggleReelLike(reel.id)}
          aria-pressed={liked}
          aria-label={liked ? 'Unlike reel' : 'Like reel'}
        >
          <span aria-hidden="true">{liked ? '❤️' : '🤍'}</span>
          <span>{formatCount(reel.likes.length)}</span>
        </button>
        <button className="reel-action-btn" onClick={() => setShowComments(true)} aria-label="View comments">
          <span aria-hidden="true">💬</span>
          <span>{formatCount(reel.comments.length)}</span>
        </button>
        <button
          className="reel-action-btn"
          aria-label="Share reel"
          onClick={() => {
            navigator.clipboard?.writeText(`${window.location.origin}/reels?reel=${reel.id}`);
          }}
        >
          <span aria-hidden="true">📤</span>
        </button>
        <button
          className="reel-action-btn"
          onClick={() => setMuted((m) => !m)}
          aria-label={muted ? 'Unmute' : 'Mute'}
        >
          <span aria-hidden="true">{muted ? '🔇' : '🔊'}</span>
        </button>
      </div>

      {showComments && (
        <div className="reel-comments-panel">
          <div className="reel-comments-header">
            <h4>Comments</h4>
            <button onClick={() => setShowComments(false)} aria-label="Close comments">✕</button>
          </div>
          <div className="reel-comments-list">
            {reel.comments.length === 0 ? (
              <p className="reel-comments-empty">No comments yet. Be the first!</p>
            ) : (
              reel.comments.map((c) => {
                const commenter = getUserById(c.userId);
                return (
                  <div className="comment" key={c.id}>
                    <Avatar src={commenter?.avatar} name={commenter?.username} size="xs" />
                    <div className="comment-content">
                      <div className="comment-text">
                        <strong>{commenter?.username || 'Unknown'}</strong> {c.text}
                      </div>
                      <div className="comment-meta"><span>{timeAgo(c.timestamp)}</span></div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
          <form
            className="add-comment"
            onSubmit={(e) => {
              e.preventDefault();
              if (!commentText.trim()) return;
              addReelComment(reel.id, commentText);
              setCommentText('');
            }}
          >
            <input
              className="comment-input"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Add a comment..."
              aria-label="Add a comment"
            />
            <button type="submit" className="comment-submit-btn" disabled={!commentText.trim()}>
              Post
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
