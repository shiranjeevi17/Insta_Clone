import { createContext, useState, useEffect, useContext, useCallback, useMemo } from 'react';
import { getStorage, setStorage, STORAGE_KEYS } from '../utils/storage';
import { genId } from '../utils/format';
import { AuthContext } from './AuthContext';
import { ToastContext } from './ToastContext';

export const AppContext = createContext(null);

const STORY_LIFETIME_MS = 24 * 60 * 60 * 1000;

export const AppProvider = ({ children }) => {
  const { user, users } = useContext(AuthContext);
  const { showToast } = useContext(ToastContext) || {};

  const [posts, setPosts] = useState([]);
  const [stories, setStories] = useState([]);
  const [storyViews, setStoryViews] = useState({});
  const [reels, setReels] = useState([]);
  const [saves, setSaves] = useState({});
  const [notifications, setNotifications] = useState([]);
  const [messages, setMessages] = useState({});
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const { initializeStorage } = await import('../utils/storage');
        await initializeStorage();
        setPosts(getStorage(STORAGE_KEYS.POSTS, []));
        setStories(getStorage(STORAGE_KEYS.STORIES, []));
        setStoryViews(getStorage(STORAGE_KEYS.STORY_VIEWS, {}));
        setReels(getStorage(STORAGE_KEYS.REELS, []));
        setSaves(getStorage(STORAGE_KEYS.SAVES, {}));
        setNotifications(getStorage(STORAGE_KEYS.NOTIFICATIONS, []));
        setMessages(getStorage(STORAGE_KEYS.MESSAGES, {}));
      } catch (err) {
        console.error('Failed to load app data', err);
      } finally {
        setDataLoading(false);
      }
    };

    loadData();
  }, []);

  const persist = useCallback(
    (key, value, setter, { warnOnQuota = false } = {}) => {
      setter(value);
      const result = setStorage(key, value);
      if (!result.ok && result.quotaExceeded && warnOnQuota && showToast) {
        showToast('Your browser storage is full, so this large file may not be saved after a refresh.', {
          type: 'error',
          duration: 5000,
        });
      }
      return result;
    },
    [showToast]
  );

  const getUserById = useCallback((id) => users.find((u) => u.id === id) || null, [users]);

  // ---------- Posts ----------
  const createPost = useCallback(
    ({ caption, media, location }) => {
      if (!user) return null;
      const newPost = {
        id: genId('p'),
        userId: user.id,
        caption: caption?.trim() || '',
        location: location?.trim() || '',
        media,
        timestamp: new Date().toISOString(),
        likes: [],
        comments: [],
      };
      const next = [newPost, ...posts];
      persist(STORAGE_KEYS.POSTS, next, setPosts, { warnOnQuota: true });
      return newPost;
    },
    [user, posts, persist]
  );

  const deletePost = useCallback(
    (postId) => {
      persist(STORAGE_KEYS.POSTS, posts.filter((p) => p.id !== postId), setPosts);
    },
    [posts, persist]
  );

  const addNotification = useCallback(
    (toUserId, fromUserId, type, extra = {}) => {
      if (toUserId === fromUserId) return;
      const next = [
        { id: genId('n'), toUserId, fromUserId, type, timestamp: new Date().toISOString(), read: false, ...extra },
        ...notifications,
      ];
      persist(STORAGE_KEYS.NOTIFICATIONS, next, setNotifications);
    },
    [notifications, persist]
  );

  const toggleLike = useCallback(
    (postId) => {
      if (!user) return;
      let likedNow = false;
      const next = posts.map((p) => {
        if (p.id !== postId) return p;
        const already = p.likes.includes(user.id);
        likedNow = !already;
        return {
          ...p,
          likes: already ? p.likes.filter((id) => id !== user.id) : [...p.likes, user.id],
        };
      });
      persist(STORAGE_KEYS.POSTS, next, setPosts);
      const post = posts.find((p) => p.id === postId);
      if (likedNow && post) addNotification(post.userId, user.id, 'like', { postId });
    },
    [user, posts, persist, addNotification]
  );

  const addComment = useCallback(
    (postId, text) => {
      if (!user || !text?.trim()) return;
      const comment = { id: genId('c'), userId: user.id, text: text.trim(), timestamp: new Date().toISOString() };
      const next = posts.map((p) => (p.id === postId ? { ...p, comments: [...p.comments, comment] } : p));
      persist(STORAGE_KEYS.POSTS, next, setPosts);
      const post = posts.find((p) => p.id === postId);
      if (post) addNotification(post.userId, user.id, 'comment', { postId, text: text.trim() });
    },
    [user, posts, persist, addNotification]
  );

  const deleteComment = useCallback(
    (postId, commentId) => {
      const next = posts.map((p) =>
        p.id === postId ? { ...p, comments: p.comments.filter((c) => c.id !== commentId) } : p
      );
      persist(STORAGE_KEYS.POSTS, next, setPosts);
    },
    [posts, persist]
  );

  const toggleSave = useCallback(
    (postId) => {
      if (!user) return;
      const mine = saves[user.id] || [];
      const already = mine.includes(postId);
      const nextMine = already ? mine.filter((id) => id !== postId) : [...mine, postId];
      persist(STORAGE_KEYS.SAVES, { ...saves, [user.id]: nextMine }, setSaves);
    },
    [user, saves, persist]
  );

  const isSaved = useCallback((postId) => Boolean(user && (saves[user.id] || []).includes(postId)), [user, saves]);

  const getSavedPosts = useCallback(() => {
    if (!user) return [];
    const mine = saves[user.id] || [];
    return posts.filter((p) => mine.includes(p.id));
  }, [user, saves, posts]);

  const getFeedPosts = useCallback(() => {
    if (!user) return [];
    return posts
      .filter((p) => p.userId === user.id || user.following.includes(p.userId))
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  }, [user, posts]);

  const getUserPosts = useCallback(
    (userId) => posts.filter((p) => p.userId === userId).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)),
    [posts]
  );

  const getExplorePosts = useCallback(() => {
    return [...posts].sort((a, b) => b.likes.length + b.comments.length - (a.likes.length + a.comments.length));
  }, [posts]);

  // ---------- Stories ----------
  const activeStoriesByUser = useMemo(() => {
    const cutoff = Date.now() - STORY_LIFETIME_MS;
    const active = stories.filter((s) => new Date(s.timestamp).getTime() > cutoff);
    const grouped = new Map();
    active.forEach((s) => {
      if (!grouped.has(s.userId)) grouped.set(s.userId, []);
      grouped.get(s.userId).push(s);
    });
    grouped.forEach((list) => list.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp)));
    return grouped;
  }, [stories]);

  const getStoryTray = useCallback(() => {
    if (!user) return [];
    const relevantIds = new Set([user.id, ...user.following]);
    const viewed = new Set(storyViews[user.id] || []);
    const tray = [];
    relevantIds.forEach((uid) => {
      const userStories = activeStoriesByUser.get(uid);
      if (userStories?.length) {
        tray.push({
          userId: uid,
          stories: userStories,
          hasUnseen: userStories.some((s) => !viewed.has(s.id)),
        });
      }
    });
    // Own story first, then unseen, then seen.
    return tray.sort((a, b) => {
      if (a.userId === user.id) return -1;
      if (b.userId === user.id) return 1;
      return a.hasUnseen === b.hasUnseen ? 0 : a.hasUnseen ? -1 : 1;
    });
  }, [user, activeStoriesByUser, storyViews]);

  const createStory = useCallback(
    (media) => {
      if (!user) return null;
      const newStory = { id: genId('s'), userId: user.id, media, timestamp: new Date().toISOString() };
      persist(STORAGE_KEYS.STORIES, [newStory, ...stories], setStories, { warnOnQuota: true });
      return newStory;
    },
    [user, stories, persist]
  );

  const markStoryViewed = useCallback(
    (storyId) => {
      if (!user) return;
      const mine = storyViews[user.id] || [];
      if (mine.includes(storyId)) return;
      persist(STORAGE_KEYS.STORY_VIEWS, { ...storyViews, [user.id]: [...mine, storyId] }, setStoryViews);
    },
    [user, storyViews, persist]
  );

  // ---------- Reels ----------
  const createReel = useCallback(
    ({ video, caption }) => {
      if (!user) return null;
      const newReel = { id: genId('r'), userId: user.id, video, caption: caption?.trim() || '', timestamp: new Date().toISOString(), likes: [], comments: [] };
      persist(STORAGE_KEYS.REELS, [newReel, ...reels], setReels, { warnOnQuota: true });
      return newReel;
    },
    [user, reels, persist]
  );

  const toggleReelLike = useCallback(
    (reelId) => {
      if (!user) return;
      const next = reels.map((r) => {
        if (r.id !== reelId) return r;
        const already = r.likes.includes(user.id);
        return { ...r, likes: already ? r.likes.filter((id) => id !== user.id) : [...r.likes, user.id] };
      });
      persist(STORAGE_KEYS.REELS, next, setReels);
    },
    [user, reels, persist]
  );

  const addReelComment = useCallback(
    (reelId, text) => {
      if (!user || !text?.trim()) return;
      const comment = { id: genId('rc'), userId: user.id, text: text.trim(), timestamp: new Date().toISOString() };
      const next = reels.map((r) => (r.id === reelId ? { ...r, comments: [...r.comments, comment] } : r));
      persist(STORAGE_KEYS.REELS, next, setReels);
    },
    [user, reels, persist]
  );

  // ---------- Notifications ----------
  const getMyNotifications = useCallback(() => {
    if (!user) return [];
    return notifications
      .filter((n) => n.toUserId === user.id)
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  }, [user, notifications]);

  const markNotificationRead = useCallback(
    (id) => {
      persist(STORAGE_KEYS.NOTIFICATIONS, notifications.map((n) => (n.id === id ? { ...n, read: true } : n)), setNotifications);
    },
    [notifications, persist]
  );

  const markAllNotificationsRead = useCallback(() => {
    if (!user) return;
    persist(
      STORAGE_KEYS.NOTIFICATIONS,
      notifications.map((n) => (n.toUserId === user.id ? { ...n, read: true } : n)),
      setNotifications
    );
  }, [user, notifications, persist]);

  // ---------- Messages ----------
  const conversationKey = (aId, bId) => [aId, bId].sort().join('__');

  const sendMessage = useCallback(
    (recipientId, text) => {
      if (!user || !text?.trim()) return;
      const key = conversationKey(user.id, recipientId);
      const existing = messages[key] || [];
      const newMessage = { id: genId('m'), senderId: user.id, text: text.trim(), timestamp: new Date().toISOString() };
      persist(STORAGE_KEYS.MESSAGES, { ...messages, [key]: [...existing, newMessage] }, setMessages);
    },
    [user, messages, persist]
  );

  const getConversationMessages = useCallback(
    (otherUserId) => {
      if (!user) return [];
      return messages[conversationKey(user.id, otherUserId)] || [];
    },
    [user, messages]
  );

  const getConversations = useCallback(() => {
    if (!user) return [];
    const list = [];
    Object.entries(messages).forEach(([key, msgs]) => {
      if (!key.includes(user.id) || msgs.length === 0) return;
      const [a, b] = key.split('__');
      const otherId = a === user.id ? b : a;
      list.push({ userId: otherId, lastMessage: msgs[msgs.length - 1] });
    });
    return list.sort((a, b) => new Date(b.lastMessage.timestamp) - new Date(a.lastMessage.timestamp));
  }, [user, messages]);

  const value = {
    dataLoading,
    posts,
    stories,
    reels,
    notifications,
    getUserById,
    // posts
    createPost,
    deletePost,
    toggleLike,
    addComment,
    deleteComment,
    toggleSave,
    isSaved,
    getSavedPosts,
    getFeedPosts,
    getUserPosts,
    getExplorePosts,
    // stories
    getStoryTray,
    createStory,
    markStoryViewed,
    // reels
    createReel,
    toggleReelLike,
    addReelComment,
    // notifications
    getMyNotifications,
    markNotificationRead,
    markAllNotificationsRead,
    // messages
    sendMessage,
    getConversationMessages,
    getConversations,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
