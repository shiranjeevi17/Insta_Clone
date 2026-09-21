import { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { ToastContext } from '../context/ToastContext';
import Layout from '../components/layout/Layout';
import MediaUploader from '../components/common/MediaUploader';
import Button from '../components/common/Button';
import FormInput from '../components/common/FormInput';
import { validatePost, hasErrors } from '../utils/validation';

export default function CreatePost() {
  const navigate = useNavigate();
  const { createPost } = useContext(AppContext);
  const { showToast } = useContext(ToastContext) || {};

  const [media, setMedia] = useState([]);
  const [caption, setCaption] = useState('');
  const [location, setLocation] = useState('');
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validatePost({ media, caption });
    setErrors(validationErrors);
    if (hasErrors(validationErrors)) return;

    setSubmitting(true);
    try {
      // Strip transient preview-only fields before persisting.
      const cleanMedia = media.map(({ type, url, persisted }) => ({ type, url, persisted }));
      createPost({ caption, media: cleanMedia, location });
      showToast?.('Post shared!', { type: 'success' });
      navigate('/');
    } catch (err) {
      showToast?.('Failed to create post. Please try again.', { type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Layout>
      <div className="page-narrow">
        <div className="card create-post-card">
          <h2>Create Post</h2>

          <form onSubmit={handleSubmit} noValidate>
            <MediaUploader value={media} onChange={setMedia} multiple maxItems={5} />
            {errors.media && <span className="error-text" role="alert">{errors.media}</span>}

            <FormInput
              as="textarea"
              label="Caption"
              placeholder="Write a caption..."
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              error={errors.caption}
              maxLength={2200}
              style={{ minHeight: 120 }}
            />

            <FormInput
              label="Location (optional)"
              placeholder="Add location..."
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />

            <div className="form-actions">
              <Button type="submit" variant="primary" loading={submitting}>
                Share
              </Button>
              <Button type="button" variant="secondary" onClick={() => navigate('/')} disabled={submitting}>
                Cancel
              </Button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
}
