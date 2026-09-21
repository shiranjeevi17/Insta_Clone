import { useContext, useState, useRef } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { AppContext } from '../../context/AppContext';
import { ToastContext } from '../../context/ToastContext';
import Avatar from '../common/Avatar';
import StoryViewer from './StoryViewer';
import { buildMediaDescriptor } from '../../utils/media';
import Spinner from '../common/Spinner';

export default function StoryTray() {
  const { user, getUserById } = useContext(AuthContext);
  const { getStoryTray, createStory } = useContext(AppContext);
  const { showToast } = useContext(ToastContext) || {};
  const [viewerUserId, setViewerUserId] = useState(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const tray = getStoryTray();
  const myEntry = tray.find((t) => t.userId === user.id);

  const handleAddStory = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const descriptor = await buildMediaDescriptor(file);
      createStory({ type: descriptor.type, url: descriptor.url });
      showToast?.('Story added', { type: 'success' });
    } catch (err) {
      showToast?.(err.message || 'Could not add story', { type: 'error' });
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="stories-container" role="list" aria-label="Stories">
      <div className="story" role="listitem">
        <button
          className="story-avatar-btn"
          onClick={() => (myEntry ? setViewerUserId(user.id) : fileInputRef.current?.click())}
          aria-label={myEntry ? 'View your story' : 'Add a story'}
        >
          <div className={`story-ring ${myEntry?.hasUnseen ? 'unseen' : myEntry ? 'seen' : 'none'}`}>
            {uploading ? <Spinner size={24} /> : <Avatar src={user.avatar} name={user.fullName} size="lg" />}
          </div>
          {!myEntry && (
            <span className="story-add-badge" aria-hidden="true">＋</span>
          )}
        </button>
        <span className="story-name">Your story</span>
        <input ref={fileInputRef} type="file" accept="image/*,video/*" hidden onChange={handleAddStory} />
      </div>

      {tray
        .filter((t) => t.userId !== user.id)
        .map((entry) => {
          const storyUser = getUserById(entry.userId);
          if (!storyUser) return null;
          return (
            <div className="story" role="listitem" key={entry.userId}>
              <button
                className="story-avatar-btn"
                onClick={() => setViewerUserId(entry.userId)}
                aria-label={`View ${storyUser.username}'s story`}
              >
                <div className={`story-ring ${entry.hasUnseen ? 'unseen' : 'seen'}`}>
                  <Avatar src={storyUser.avatar} name={storyUser.fullName} size="lg" />
                </div>
              </button>
              <span className="story-name">{storyUser.username}</span>
            </div>
          );
        })}

      {viewerUserId && (
        <StoryViewer
          startUserId={viewerUserId}
          tray={tray}
          onClose={() => setViewerUserId(null)}
        />
      )}
    </div>
  );
}
