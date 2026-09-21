// Centralized validation logic used by Login, Signup, CreatePost and
// EditProfile so validation rules live in exactly one place.

export const isValidEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());

export const isValidUsername = (value) => /^[a-zA-Z0-9._]{3,30}$/.test(value.trim());

export const isValidUrl = (value) => {
  if (!value) return true; // optional field
  try {
    // eslint-disable-next-line no-new
    new URL(value.startsWith('http') ? value : `https://${value}`);
    return true;
  } catch {
    return false;
  }
};

export const validateLogin = ({ identifier, password }) => {
  const errors = {};
  if (!identifier?.trim()) {
    errors.identifier = 'Email or username is required';
  } else if (identifier.includes('@') && !isValidEmail(identifier)) {
    errors.identifier = 'Please enter a valid email';
  }
  if (!password) {
    errors.password = 'Password is required';
  } else if (password.length < 6) {
    errors.password = 'Password must be at least 6 characters';
  }
  return errors;
};

export const validateSignup = ({ fullName, username, email, password, confirmPassword }, existingUsers = []) => {
  const errors = {};

  if (!fullName?.trim()) {
    errors.fullName = 'Full name is required';
  } else if (fullName.trim().length < 2) {
    errors.fullName = 'Full name must be at least 2 characters';
  }

  if (!username?.trim()) {
    errors.username = 'Username is required';
  } else if (!isValidUsername(username)) {
    errors.username = 'Use 3-30 letters, numbers, dots or underscores';
  } else if (existingUsers.some((u) => u.username.toLowerCase() === username.trim().toLowerCase())) {
    errors.username = 'Username is already taken';
  }

  if (!email?.trim()) {
    errors.email = 'Email is required';
  } else if (!isValidEmail(email)) {
    errors.email = 'Please enter a valid email';
  } else if (existingUsers.some((u) => u.email.toLowerCase() === email.trim().toLowerCase())) {
    errors.email = 'Email is already registered';
  }

  if (!password) {
    errors.password = 'Password is required';
  } else if (password.length < 6) {
    errors.password = 'Password must be at least 6 characters';
  }

  if (password !== confirmPassword) {
    errors.confirmPassword = 'Passwords do not match';
  }

  return errors;
};

export const validateProfile = ({ fullName, bio, website }) => {
  const errors = {};
  if (!fullName?.trim()) errors.fullName = 'Name cannot be empty';
  if (bio && bio.length > 150) errors.bio = 'Bio must be 150 characters or fewer';
  if (website && !isValidUrl(website)) errors.website = 'Enter a valid website URL';
  return errors;
};

export const validatePost = ({ media, caption }) => {
  const errors = {};
  if (!media || media.length === 0) errors.media = 'Please add at least one photo or video';
  if (caption && caption.length > 2200) errors.caption = 'Caption is too long';
  return errors;
};

export const hasErrors = (errors) => Object.keys(errors).length > 0;
