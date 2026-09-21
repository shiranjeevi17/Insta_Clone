// Single source of truth for all browser storage access in the app.
// Data is persisted in IndexedDB instead of localStorage.

export const STORAGE_KEYS = {
  USERS: 'ig_users',
  AUTH: 'ig_auth',
  POSTS: 'ig_posts',
  STORIES: 'ig_stories',
  STORY_VIEWS: 'ig_story_views',
  REELS: 'ig_reels',
  SAVES: 'ig_saves',
  NOTIFICATIONS: 'ig_notifications',
  MESSAGES: 'ig_messages',
  THEME: 'ig_theme',
  SEEDED: 'ig_seeded_v2',
};

const DB_NAME = 'instaclone-db';
const DB_VERSION = 1;
const STORE_NAME = 'keyValue';
let dbPromise = null;
const cache = new Map();
let initialized = false;

const openDatabase = () => {
  if (dbPromise) return dbPromise;

  dbPromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'key' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || new Error('Failed to open IndexedDB'));
  });

  return dbPromise;
};

const readAllFromIndexedDB = async () => {
  const db = await openDatabase();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readonly');
    const request = transaction.objectStore(STORE_NAME).getAll();

    request.onsuccess = () => resolve(request.result || []);
    request.onerror = () => reject(request.error || new Error('Failed to read IndexedDB'));
  });
};

const writeToIndexedDB = async (key, value) => {
  const db = await openDatabase();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    transaction.objectStore(STORE_NAME).put({ key, value });

    transaction.oncomplete = () => resolve({ ok: true });
    transaction.onerror = () => reject(transaction.error || new Error('Failed to write IndexedDB'));
    transaction.onabort = () => reject(transaction.error || new Error('IndexedDB transaction aborted'));
  });
};

const deleteFromIndexedDB = async (key) => {
  const db = await openDatabase();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    transaction.objectStore(STORE_NAME).delete(key);

    transaction.oncomplete = () => resolve({ ok: true });
    transaction.onerror = () => reject(transaction.error || new Error('Failed to delete from IndexedDB'));
    transaction.onabort = () => reject(transaction.error || new Error('IndexedDB transaction aborted'));
  });
};

/**
 * Initializes the IndexedDB cache.
 *
 * If this app previously stored data in localStorage, it is migrated once
 * into IndexedDB so existing users do not lose their data.
 */
export const initializeStorage = async () => {
  if (initialized) return;

  try {
    const records = await readAllFromIndexedDB();
    cache.clear();
    records.forEach(({ key, value }) => cache.set(key, value));

    // Migrate any legacy localStorage key that is not already present in IndexedDB.
    const legacyRecords = [];
    Object.values(STORAGE_KEYS).forEach((key) => {
      if (cache.has(key)) return;

      try {
        const item = localStorage.getItem(key);
        if (item !== null) {
          legacyRecords.push({ key, value: JSON.parse(item) });
        }
      } catch (err) {
        console.error(`Failed to migrate storage key "${key}"`, err);
      }
    });

    if (legacyRecords.length > 0) {
      const db = await openDatabase();

      await new Promise((resolve, reject) => {
        const transaction = db.transaction(STORE_NAME, 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        legacyRecords.forEach((record) => store.put(record));
        transaction.oncomplete = resolve;
        transaction.onerror = () => reject(transaction.error);
        transaction.onabort = () => reject(transaction.error);
      });

      legacyRecords.forEach(({ key, value }) => {
        cache.set(key, value);
        try {
          localStorage.removeItem(key);
        } catch (err) {
          console.error(`Failed to remove migrated key "${key}"`, err);
        }
      });
    }

    initialized = true;
  } catch (err) {
    console.error('Failed to initialize IndexedDB storage', err);
    initialized = true;
    throw err;
  }
};

export const getStorage = (key, defaultValue = null) => {
  return cache.has(key) ? cache.get(key) : defaultValue;
};

export const setStorage = (key, value) => {
  cache.set(key, value);

  writeToIndexedDB(key, value).catch((err) => {
    console.error(`Failed to write storage key "${key}"`, err);
  });

  return { ok: true };
};

export const removeStorage = (key) => {
  cache.delete(key);

  deleteFromIndexedDB(key).catch((err) => {
    console.error(`Failed to remove storage key "${key}"`, err);
  });
};

export const clearAppStorage = () => {
  Object.values(STORAGE_KEYS).forEach(removeStorage);
};
