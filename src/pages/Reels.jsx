import { useCallback, useContext, useRef, useState, useEffect } from 'react';
import { AppContext } from '../context/AppContext';
import { ToastContext } from '../context/ToastContext';
import Layout from '../components/layout/Layout';
import ReelCard from '../components/reels/ReelCard';
import EmptyState from '../components/common/EmptyState';
import Spinner from '../components/common/Spinner';
import Modal from '../components/common/Modal';
import MediaUploader from '../components/common/MediaUploader';
import Button from '../components/common/Button';
import FormInput from '../components/common/FormInput';

export default function Reels() {
  const { dataLoading, reels, createReel } = useContext(AppContext);
  const { showToast } = useContext(ToastContext) || {};
  const containerRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [media, setMedia] = useState([]);
  const [caption, setCaption] = useState('');
  const [error, setError] = useState('');

  const handleUploadClose = useCallback(() => setUploadOpen(false), []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const idx = Number(entry.target.dataset.index);
            setActiveIndex(idx);
          }
        });
      },
      { root: container, threshold: 0.6 }
    );

    const items = container.querySelectorAll('.reel-slide');
    items.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [reels.length]);

  return (
    <Layout fullBleed>
      <div className="reels-page">
        <button className="reel-upload-fab" onClick={() => setUploadOpen(true)} aria-label="Upload a reel">
          ➕ <span>New Reel</span>
        </button>

        {dataLoading ? (
          <div className="flex-center" style={{ minHeight: '70vh' }}>
            <Spinner size={40} />
          </div>
        ) : reels.length === 0 ? (
          <EmptyState icon="🎬" title="No reels available" message="Reels you create or that people you follow post will show up here." />
        ) : (
          <div className="reels-scroller" ref={containerRef}>
            {reels.map((reel, idx) => (
              <div className="reel-slide" data-index={idx} key={reel.id}>
                <ReelCard reel={reel} active={idx === activeIndex} />
              </div>
            ))}
          </div>
        )}
      </div>

      <Modal isOpen={uploadOpen} onClose={handleUploadClose} title="Upload a Reel">
        <MediaUploader value={media} onChange={setMedia} multiple={false} allowVideo maxItems={1} label="Add a video" />
        {error && <span className="error-text" role="alert">{error}</span>}
        <FormInput
          as="textarea"
          label="Caption"
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          placeholder="Write a caption..."
          style={{ minHeight: 80 }}
        />
        <div className="modal-actions">
          <Button variant="secondary" onClick={handleUploadClose}>Cancel</Button>
          <Button
            variant="primary"
            onClick={() => {
              const clip = media[0];
              if (!clip || clip.type !== 'video') {
                setError('Please select a video file.');
                return;
              }
              createReel({ video: clip.url, caption });
              setUploadOpen(false);
              setMedia([]);
              setCaption('');
              setError('');
              showToast?.('Reel posted!', { type: 'success' });
            }}
          >
            Post Reel
          </Button>
        </div>
      </Modal>
    </Layout>
  );
}
