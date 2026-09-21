import { createContext, useState, useEffect, useCallback, useMemo } from 'react';
import { getStorage, setStorage, removeStorage, STORAGE_KEYS, initializeStorage } from '../utils/storage';
import { genId } from '../utils/format';
import { seedDemoData } from '../data/seed';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [users, setUsers] = useState([]);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authError, setAuthError] = useState('');

  // Single initialization point for the whole app's demo data + session.
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        await initializeStorage();
        await seedDemoData();
        setUsers(getStorage(STORAGE_KEYS.USERS, []));
        setCurrentUserId(getStorage(STORAGE_KEYS.AUTH, null));
      } catch (err) {
        console.error('Failed to initialize auth', err);
        setAuthError('Something went wrong loading your session.');
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const persistUsers = useCallback((nextUsers) => {
    setUsers(nextUsers);
    setStorage(STORAGE_KEYS.USERS, nextUsers);
  }, []);

  // The logged-in user is always resolved live from the users list, so
  // there is exactly one copy of user data anywhere in the app.
  const user = useMemo(
    () => users.find((u) => u.id === currentUserId) || null,
    [users, currentUserId]
  );

  const register = useCallback(
    ({ fullName, username, email, password }) => {
      const trimmedUsername = username.trim();
      const trimmedEmail = email.trim().toLowerCase();

      if (users.some((u) => u.username.toLowerCase() === trimmedUsername.toLowerCase())) {
        throw new Error('Username already exists');
      }
      if (users.some((u) => u.email.toLowerCase() === trimmedEmail)) {
        throw new Error('Email already registered');
      }

      const newUser = {
        id: genId('u'),
        username: trimmedUsername,
        email: trimmedEmail,
        password,
        fullName: fullName.trim(),
        avatar: null,
        bio: '',
        website: '',
        followers: [],
        following: [],
        createdAt: new Date().toISOString(),
      };

      const nextUsers = [...users, newUser];
      persistUsers(nextUsers);
      setCurrentUserId(newUser.id);
      setStorage(STORAGE_KEYS.AUTH, newUser.id);
      return newUser;
    },
    [users, persistUsers]
  );

  const login = useCallback(
    (identifier, password) => {
      const found = users.find(
        (u) =>
          (u.email.toLowerCase() === identifier.trim().toLowerCase() ||
            u.username.toLowerCase() === identifier.trim().toLowerCase()) &&
          u.password === password
      );
      if (!found) {
        throw new Error('Invalid email/username or password');
      }
      setCurrentUserId(found.id);
      setStorage(STORAGE_KEYS.AUTH, found.id);
      return found;
    },
    [users]
  );

  const logout = useCallback(() => {
    setCurrentUserId(null);
    removeStorage(STORAGE_KEYS.AUTH);
  }, []);

  const updateProfile = useCallback(
    (updates) => {
      if (!currentUserId) return;
      const nextUsers = users.map((u) => (u.id === currentUserId ? { ...u, ...updates } : u));
      persistUsers(nextUsers);
    },
    [users, currentUserId, persistUsers]
  );

  const toggleFollow = useCallback(
    (targetUserId) => {
      if (!currentUserId || targetUserId === currentUserId) return;
      const nextUsers = users.map((u) => {
        if (u.id === currentUserId) {
          const already = u.following.includes(targetUserId);
          return {
            ...u,
            following: already
              ? u.following.filter((id) => id !== targetUserId)
              : [...u.following, targetUserId],
          };
        }
        if (u.id === targetUserId) {
          const already = u.followers.includes(currentUserId);
          return {
            ...u,
            followers: already
              ? u.followers.filter((id) => id !== currentUserId)
              : [...u.followers, currentUserId],
          };
        }
        return u;
      });
      persistUsers(nextUsers);
    },
    [users, currentUserId, persistUsers]
  );

  const isFollowing = useCallback(
    (targetUserId) => Boolean(user?.following?.includes(targetUserId)),
    [user]
  );

  const getUserById = useCallback((id) => users.find((u) => u.id === id) || null, [users]);
  const getUserByUsername = useCallback(
    (username) => users.find((u) => u.username.toLowerCase() === username?.toLowerCase()) || null,
    [users]
  );

  const value = {
    user,
    users,
    isLoading,
    authError,
    isAuthenticated: Boolean(user),
    register,
    login,
    logout,
    updateProfile,
    toggleFollow,
    isFollowing,
    getUserById,
    getUserByUsername,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
