// Utilities for handling real local file uploads (images & video).
// This is a frontend-only project, so there is no cloud storage:
//  - Images and videos are converted to data URLs so they can be persisted
//    in IndexedDB and survive a refresh. IndexedDB is used instead of
//    localStorage, so larger media files can be persisted within the browser quota.

export const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
export const ACCEPTED_VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime'];

export const MAX_IMAGE_SIZE = 8 * 1024 * 1024; // 8MB
export const MAX_VIDEO_SIZE = 60 * 1024 * 1024; // 60MB hard cap for selection

export const isImageFile = (file) => ACCEPTED_IMAGE_TYPES.includes(file.type);
export const isVideoFile = (file) => ACCEPTED_VIDEO_TYPES.includes(file.type);

/**
 * Validates a File for use as post/story/reel media.
 * Returns { valid: boolean, error?: string }
 */
export function validateMediaFile(file, { allowVideo = true } = {}) {
  if (!file) return { valid: false, error: 'No file selected' };

  const isImage = isImageFile(file);
  const isVideo = allowVideo && isVideoFile(file);

  if (!isImage && !isVideo) {
    return {
      valid: false,
      error: allowVideo
        ? 'Unsupported file type. Please choose a JPG, PNG, GIF, WEBP image or an MP4/WEBM video.'
        : 'Unsupported file type. Please choose a JPG, PNG, GIF or WEBP image.',
    };
  }

  if (isImage && file.size > MAX_IMAGE_SIZE) {
    return { valid: false, error: 'Image is too large. Max size is 8MB.' };
  }

  if (isVideo && file.size > MAX_VIDEO_SIZE) {
    return { valid: false, error: 'Video is too large. Max size is 60MB.' };
  }

  return { valid: true, kind: isImage ? 'image' : 'video' };
}

export function readFileAsDataURL(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error('Could not read file'));
    reader.readAsDataURL(file);
  });
}

/**
 * Builds a media descriptor for a selected file.
 * Images always become persistable data URLs.
 * Videos become an object URL for instant preview, plus a data URL only if
 * persisted to IndexedDB.
 */
export async function buildMediaDescriptor(file) {
  const { valid, error, kind } = validateMediaFile(file);
  if (!valid) throw new Error(error);

  const previewUrl = URL.createObjectURL(file);

  if (kind === 'image') {
    const dataUrl = await readFileAsDataURL(file);
    return {
      type: 'image',
      url: dataUrl,
      previewUrl,
      persisted: true,
      name: file.name,
      size: file.size,
    };
  }

  // video
  let dataUrl = null;
  try {
    dataUrl = await readFileAsDataURL(file);
  } catch {
    dataUrl = null;
  }

  return {
    type: 'video',
    url: dataUrl || previewUrl,
    previewUrl,
    persisted: Boolean(dataUrl),
    name: file.name,
    size: file.size,
  };
}
