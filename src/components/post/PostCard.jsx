import { useContext, useState } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { AppContext } from '../../context/AppContext';
import { ToastContext } from '../../context/ToastContext';
import Avatar from '../common/Avatar';
import ConfirmDialog from '../common/ConfirmDialog';
import { timeAgo, formatCount } from '../../utils/format';

export default function PostCard({ post }) {
  const { user, getUserById } = useContext(AuthContext);
  const { toggleLike, addComment, deleteComment, toggleSave, isSaved, deletePost, getUserById: getUserByIdApp } = useContext(AppContext);
  const { showToast } = useContext(ToastContext) || {};

  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [showMenu, setShowMenu] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [mediaIndex, setMediaIndex] = useState(0);
  const [likeBurst, setLikeBurst] = useState(false);
  const [brokenMedia, setBrokenMedia] = useState(false);

  const author = getUserById(post.userId) || getUserByIdApp(post.userId);
  const isOwnPost = user?.id === post.userId;
  const liked = post.likes.includes(user?.id);
  const saved = isSaved(post.id);
  const media = post.media || [];
  const current = media[mediaIndex];

  if (!author) {
    // Defensive: malformed/orphaned post data should never blank the page.
    return null;
  }

  const handleLike = () => toggleLike(post.id);

  const handleDoubleClickLike = () => {
    if (!liked) toggleLike(post.id);
    setLikeBurst(true);
    setTimeout(() => setLikeBurst(false), 700);
  };

  const handleAddComment = (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    addComment(post.id, commentText);
    setCommentText('');
  };

  const handleShare = async () => {
    const url = `${window.location.origin}/?post=${post.id}`;
    try {
      await navigator.clipboard.writeText(url);
      showToast?.('Post link copied to clipboard', { type: 'success' });
    } catch {
      showToast?.('Could not copy link', { type: 'error' });
    }
    setShowMenu(false);
  };

  return (
    <article className="post-card">
      <header className="post-header">
        <Link to={`/profile/${author.username}`} className="post-user-info">
          <Avatar src={author.avatar} name={author.fullName || author.username} size="sm" />
          <div className="post-user-details">
            <h4>{author.username}</h4>
            {post.location && <p>{post.location}</p>}
          </div>
        </Link>

        <div className="post-header-right">
          <span className="post-timestamp">{timeAgo(post.timestamp)}</span>
          <div className="menu-anchor">
            <button
              className="post-menu-btn"
              onClick={() => setShowMenu((v) => !v)}
              aria-haspopup="true"
              aria-expanded={showMenu}
              aria-label="Post options"
            >
              ⋯
            </button>
            {showMenu && (
              <div className="dropdown-menu" role="menu">
                {isOwnPost && (
                  <button
                    role="menuitem"
                    className="dropdown-item danger"
                    onClick={() => {
                      setConfirmDelete(true);
                      setShowMenu(false);
                    }}
                  >
                    Delete Post
                  </button>
                )}
                <button role="menuitem" className="dropdown-item" onClick={handleShare}>
                  Copy Link
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="post-media" onDoubleClick={handleDoubleClickLike}>
        {!current || brokenMedia ? (
          <div className="media-broken">
            <span aria-hidden="true">🖼️</span>
            <p>Media unavailable</p>
          </div>
        ) : current.type === 'video' ? (
          <video
            src={current.url}
            controls
            playsInline
            preload="metadata"
            onError={() => setBrokenMedia(true)}
          />
        ) : (
          <img src={current.url} alt={post.caption || 'Post image'} onError={() => setBrokenMedia(true)} />
        )}

        {likeBurst && <span className="like-burst" aria-hidden="true">❤️</span>}

        {media.length > 1 && (
          <>
            <div className="carousel-counter">{mediaIndex + 1} / {media.length}</div>
            {mediaIndex > 0 && (
              <button className="carousel-nav prev" onClick={() => setMediaIndex((i) => i - 1)} aria-label="Previous media">
                ❮
              </button>
            )}
            {mediaIndex < media.length - 1 && (
              <button className="carousel-nav next" onClick={() => setMediaIndex((i) => i + 1)} aria-label="Next media">
                ❯
              </button>
            )}
          </>
        )}
      </div>

      <div className="post-actions">
        <button
          className={`action-btn like-btn ${liked ? 'liked' : ''}`}
          onClick={handleLike}
          aria-pressed={liked}
          aria-label={liked ? 'Unlike post' : 'Like post'}
        >
          {liked ? '❤️' : '🤍'}
        </button>
        <button
          className="action-btn"
          onClick={() => setShowComments((v) => !v)}
          aria-expanded={showComments}
          aria-label="Toggle comments"
        >
          💬
        </button>
        <button className="action-btn" onClick={handleShare} aria-label="Share post">
          📤
        </button>
        <span className="spacer" />
        <button
          className={`action-btn ${saved ? 'saved' : ''}`}
          onClick={() => toggleSave(post.id)}
          aria-pressed={saved}
          aria-label={saved ? 'Remove from saved' : 'Save post'}
        >
          {saved ? '🔖' : '📑'}
        </button>
      </div>

      {post.likes.length > 0 && (
        <div className="post-stats">
          <strong>{formatCount(post.likes.length)}</strong> like{post.likes.length !== 1 ? 's' : ''}
        </div>
      )}

      {post.caption && (
        <div className="post-caption">
          <strong>{author.username}</strong> {post.caption}
        </div>
      )}

      {post.comments.length > 0 && !showComments && (
        <button className="view-comments-link" onClick={() => setShowComments(true)}>
          View all {post.comments.length} comments
        </button>
      )}

      {showComments && (
        <>
          {post.comments.length > 0 && (
            <div className="comments-section">
              {post.comments.map((comment) => {
                const commenter = getUserById(comment.userId) || getUserByIdApp(comment.userId);
                return (
                  <div key={comment.id} className="comment">
                    <Avatar src={commenter?.avatar} name={commenter?.fullName || commenter?.username} size="xs" />
                    <div className="comment-content">
                      <div className="comment-text">
                        <strong>{commenter?.username || 'Unknown user'}</strong> {comment.text}
                      </div>
                      <div className="comment-meta">
                        <span>{timeAgo(comment.timestamp)}</span>
                        {comment.userId === user?.id && (
                          <button className="comment-delete-btn" onClick={() => deleteComment(post.id, comment.id)}>
                            Delete
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <form onSubmit={handleAddComment} className="add-comment">
            <input
              type="text"
              className="comment-input"
              placeholder="Add a comment..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              aria-label="Add a comment"
              maxLength={500}
            />
            <button type="submit" className="comment-submit-btn" disabled={!commentText.trim()}>
              Post
            </button>
          </form>
        </>
      )}

      <ConfirmDialog
        isOpen={confirmDelete}
        title="Delete post?"
        message="This can't be undone."
        confirmLabel="Delete"
        danger
        onCancel={() => setConfirmDelete(false)}
        onConfirm={() => {
          deletePost(post.id);
          setConfirmDelete(false);
          showToast?.('Post deleted', { type: 'success' });
        }}
      />
    </article>
  );
}
