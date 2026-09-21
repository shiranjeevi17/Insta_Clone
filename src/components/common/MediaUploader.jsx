import { useRef, useState } from 'react';
import { buildMediaDescriptor } from '../../utils/media';
import { formatFileSize } from '../../utils/format';
import Spinner from './Spinner';

/**
 * Real local file upload with preview for images & video.
 * `value` is an array of media descriptors: { type, url, name, size, persisted }
 */
export default function MediaUploader({
  value = [],
  onChange,
  multiple = true,
  allowVideo = true,
  maxItems = 5,
  label = 'Add photos or videos',
}) {
  const inputRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [dragOver, setDragOver] = useState(false);

  const handleFiles = async (fileList) => {
    setError('');
    const files = Array.from(fileList || []);
    if (files.length === 0) return;

    const room = maxItems - value.length;
    if (room <= 0) {
      setError(`You can only add up to ${maxItems} item${maxItems > 1 ? 's' : ''}.`);
      return;
    }

    setLoading(true);
    try {
      const next = [];
      for (const file of files.slice(0, room)) {
        // eslint-disable-next-line no-await-in-loop
        const descriptor = await buildMediaDescriptor(file);
        if (!allowVideo && descriptor.type === 'video') {
          throw new Error('Video is not supported here — please choose an image.');
        }
        next.push(descriptor);
      }
      onChange(multiple ? [...value, ...next] : next);
    } catch (err) {
      setError(err.message || 'Could not add that file.');
    } finally {
      setLoading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  const removeAt = (idx) => {
    const item = value[idx];
    if (item?.previewUrl) URL.revokeObjectURL(item.previewUrl);
    onChange(value.filter((_, i) => i !== idx));
  };

  const acceptTypes = allowVideo
    ? 'image/jpeg,image/png,image/gif,image/webp,video/mp4,video/webm,video/ogg,video/quicktime'
    : 'image/jpeg,image/png,image/gif,image/webp';

  return (
    <div className="media-uploader">
      {value.length === 0 ? (
        <div
          className={`media-dropzone ${dragOver ? 'drag-over' : ''}`}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            handleFiles(e.dataTransfer.files);
          }}
          onClick={() => inputRef.current?.click()}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') inputRef.current?.click();
          }}
          aria-label={label}
        >
          {loading ? (
            <Spinner size={32} />
          ) : (
            <>
              <div className="media-dropzone-icon" aria-hidden="true">🖼️</div>
              <p>{label}</p>
              <span className="field-hint">Drag & drop or click to browse</span>
            </>
          )}
        </div>
      ) : (
        <div className="media-preview-grid">
          {value.map((item, idx) => (
            <div className="media-preview-item" key={item.url + idx}>
              {item.type === 'image' ? (
                <img src={item.url} alt={`Selected media ${idx + 1}`} />
              ) : (
                <video src={item.url} muted playsInline preload="metadata" />
              )}
              {!item.persisted && (
                <span className="media-session-badge" title="Large video — kept for this session only">
                  session only
                </span>
              )}
              <button
                type="button"
                className="media-remove-btn"
                onClick={() => removeAt(idx)}
                aria-label={`Remove media ${idx + 1}`}
              >
                ✕
              </button>
              {item.size && <span className="media-size-badge">{formatFileSize(item.size)}</span>}
            </div>
          ))}
          {multiple && value.length < maxItems && (
            <button
              type="button"
              className="media-add-more"
              onClick={() => inputRef.current?.click()}
              disabled={loading}
            >
              {loading ? <Spinner size={20} /> : <>+<span>Add more</span></>}
            </button>
          )}
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept={acceptTypes}
        multiple={multiple}
        onChange={(e) => handleFiles(e.target.files)}
        hidden
      />

      {error && <span className="error-text" role="alert">{error}</span>}
    </div>
  );
}
