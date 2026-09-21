import { useContext, useEffect, useRef, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { AuthContext } from '../../context/AuthContext';
import { AppContext } from '../../context/AppContext';
import Avatar from '../common/Avatar';
import { timeAgo } from '../../utils/format';

const IMAGE_DURATION_MS = 5000;

export default function StoryViewer({ startUserId, tray, onClose }) {
  const { getUserById } = useContext(AuthContext);
  const { markStoryViewed } = useContext(AppContext);

  const [userIndex, setUserIndex] = useState(() => tray.findIndex((t) => t.userId === startUserId));
  const [storyIndex, setStoryIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [paused, setPaused] = useState(false);
  const [muted, setMuted] = useState(true);
  const [mediaError, setMediaError] = useState(false);

  const videoRef = useRef(null);
  const rafRef = useRef(null);
  const startRef = useRef(0);
  const pausedAtRef = useRef(0);

  const entry = tray[userIndex];
  const story = entry?.stories[storyIndex];
  const storyUser = entry ? getUserById(entry.userId) : null;

  const goNextUser = useCallback(() => {
    if (userIndex < tray.length - 1) {
      setUserIndex((i) => i + 1);
      setStoryIndex(0);
    } else {
      onClose();
    }
  }, [userIndex, tray.length, onClose]);

  const goPrevUser = useCallback(() => {
    if (userIndex > 0) {
      setUserIndex((i) => i - 1);
      setStoryIndex(0);
    }
  }, [userIndex]);

  const goNext = useCallback(() => {
    if (!entry) return;
    if (storyIndex < entry.stories.length - 1) {
      setStoryIndex((i) => i + 1);
    } else {
      goNextUser();
    }
  }, [entry, storyIndex, goNextUser]);

  const goPrev = useCallback(() => {
    if (storyIndex > 0) {
      setStoryIndex((i) => i - 1);
    } else {
      goPrevUser();
    }
  }, [storyIndex, goPrevUser]);

  useEffect(() => {
    setProgress(0);
    setMediaError(false);
    if (story) markStoryViewed(story.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [story?.id]);

  useEffect(() => {
    if (!story || story.media.type !== 'image' || paused) return undefined;

    startRef.current = performance.now() - pausedAtRef.current;
    const tick = (now) => {
      const elapsed = now - startRef.current;
      const pct = Math.min(100, (elapsed / IMAGE_DURATION_MS) * 100);
      setProgress(pct);
      if (pct >= 100) {
        pausedAtRef.current = 0;
        goNext();
        return;
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [story, paused, goNext]);

  useEffect(() => {
    pausedAtRef.current = 0;
  }, [story?.id]);

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') goNext();
      if (e.key === 'ArrowLeft') goPrev();
    };
    document.addEventListener('keydown', handleKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
    };
  }, [goNext, goPrev, onClose]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || story?.media.type !== 'video') return;
    if (paused) video.pause();
    else video.play().catch(() => {});
  }, [paused, story]);

  if (!entry || !story || !storyUser) return null;

  return createPortal(
    <div
      className="story-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="story-frame">
        <div className="story-progress-row">
          {entry.stories.map((s, i) => (
            <div className="story-progress-track" key={s.id}>
              <div
                className="story-progress-fill"
                style={{
                  width: i < storyIndex ? '100%' : i === storyIndex ? `${progress}%` : '0%',
                }}
              />
            </div>
          ))}
        </div>

        <div className="story-header">
          <div className="story-header-user">
            <Avatar src={storyUser.avatar} name={storyUser.fullName} size="sm" />
            <div>
              <div className="story-header-name">{storyUser.username}</div>
              <div className="story-header-time">{timeAgo(story.timestamp)}</div>
            </div>
          </div>
          <div className="story-header-actions">
            {story.media.type === 'video' && (
              <button onClick={() => setMuted((m) => !m)} aria-label={muted ? 'Unmute' : 'Mute'}>
                {muted ? '🔇' : '🔊'}
              </button>
            )}
            <button onClick={() => setPaused((p) => !p)} aria-label={paused ? 'Resume' : 'Pause'}>
              {paused ? '▶️' : '⏸️'}
            </button>
            <button onClick={onClose} aria-label="Close story">✕</button>
          </div>
        </div>

        <div className="story-media">
          {mediaError ? (
            <div className="media-broken">
              <span aria-hidden="true">🖼️</span>
              <p>This story couldn't be loaded</p>
            </div>
          ) : story.media.type === 'video' ? (
            <video
              ref={videoRef}
              src={story.media.url}
              autoPlay
              muted={muted}
              playsInline
              onTimeUpdate={(e) => {
                const v = e.currentTarget;
                if (v.duration) setProgress((v.currentTime / v.duration) * 100);
              }}
              onEnded={goNext}
              onError={() => setMediaError(true)}
            />
          ) : (
            <img src={story.media.url} alt={`${storyUser.username}'s story`} onError={() => setMediaError(true)} />
          )}
        </div>

        <button className="story-nav-zone prev" onClick={goPrev} aria-label="Previous story" />
        <button className="story-nav-zone next" onClick={goNext} aria-label="Next story" />
      </div>
    </div>,
    document.body
  );
}
