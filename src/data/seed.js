import { getStorage, setStorage, STORAGE_KEYS } from '../utils/storage';

// A small, well-known public-domain sample clip used only so Reels/Stories
// have real playable video in the demo data (no proprietary content).
const SAMPLE_VIDEO = 'https://www.w3schools.com/html/mov_bbb.mp4';

const now = Date.now();
const hoursAgo = (h) => new Date(now - h * 60 * 60 * 1000).toISOString();
const daysAgo = (d) => new Date(now - d * 24 * 60 * 60 * 1000).toISOString();

const DEMO_USERS = [
  {
    id: 'u1',
    username: 'demo',
    email: 'demo@example.com',
    password: 'demo123',
    fullName: 'Demo User',
    avatar: null,
    bio: 'Welcome to InstaClone! This is the demo account. 👋',
    website: '',
    followers: ['u2', 'u3'],
    following: ['u2'],
    createdAt: daysAgo(30),
  },
  {
    id: 'u2',
    username: 'sarah.jones',
    email: 'sarah@example.com',
    password: 'pass123',
    fullName: 'Sarah Jones',
    avatar: 'https://i.pravatar.cc/150?img=5',
    bio: 'Traveling & Photography 📸✈️',
    website: 'https://sarahjones.example.com',
    followers: ['u1', 'u3'],
    following: ['u1', 'u3'],
    createdAt: daysAgo(60),
  },
  {
    id: 'u3',
    username: 'mark.wilson',
    email: 'mark@example.com',
    password: 'pass123',
    fullName: 'Mark Wilson',
    avatar: 'https://i.pravatar.cc/150?img=12',
    bio: 'Tech enthusiast | Designer 💻🎨',
    website: '',
    followers: ['u1', 'u2'],
    following: ['u2'],
    createdAt: daysAgo(90),
  },
  {
    id: 'u4',
    username: 'emily.chen',
    email: 'emily@example.com',
    password: 'pass123',
    fullName: 'Emily Chen',
    avatar: 'https://i.pravatar.cc/150?img=32',
    bio: 'Artist & illustrator 🎨',
    website: '',
    followers: [],
    following: ['u1'],
    createdAt: daysAgo(20),
  },
];

const DEMO_POSTS = [
  {
    id: 'p1',
    userId: 'u2',
    caption: 'Amazing sunset today! 🌅 #sunset #nature #photography',
    location: 'Santa Monica, California',
    media: [{ type: 'image', url: 'https://images.unsplash.com/photo-1495616811223-4d98c6e9c869?w=800&h=800&fit=crop', persisted: true }],
    timestamp: hoursAgo(2),
    likes: ['u1', 'u3'],
    comments: [
      { id: 'c1', userId: 'u3', text: 'Beautiful shot! 😍', timestamp: hoursAgo(1) },
    ],
  },
  {
    id: 'p2',
    userId: 'u3',
    caption: 'Working on a new design project 💻 #design #coding #webdev',
    location: '',
    media: [{ type: 'image', url: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&h=800&fit=crop', persisted: true }],
    timestamp: hoursAgo(5),
    likes: ['u1', 'u2'],
    comments: [
      { id: 'c2', userId: 'u2', text: 'Looks amazing!', timestamp: hoursAgo(4) },
    ],
  },
  {
    id: 'p3',
    userId: 'u1',
    caption: 'First post! Welcome to InstaClone 🚀 #instagram #clone #react',
    location: '',
    media: [{ type: 'image', url: 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=800&h=800&fit=crop', persisted: true }],
    timestamp: daysAgo(1),
    likes: ['u2', 'u3'],
    comments: [],
  },
  {
    id: 'p4',
    userId: 'u2',
    caption: 'Mountain air hits different 🏔️ #hiking #adventure',
    location: 'Rocky Mountains',
    media: [{ type: 'image', url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=800&fit=crop', persisted: true }],
    timestamp: daysAgo(2),
    likes: ['u1'],
    comments: [],
  },
];

const DEMO_STORIES = [
  { id: 's1', userId: 'u2', media: { type: 'image', url: 'https://images.unsplash.com/photo-1520962880247-cfaf541c8724?w=600&h=1000&fit=crop' }, timestamp: hoursAgo(3) },
  { id: 's2', userId: 'u3', media: { type: 'video', url: SAMPLE_VIDEO }, timestamp: hoursAgo(6) },
  { id: 's3', userId: 'u4', media: { type: 'image', url: 'https://images.unsplash.com/photo-1500534623283-312aade485b7?w=600&h=1000&fit=crop' }, timestamp: hoursAgo(10) },
];

const DEMO_REELS = [
  {
    id: 'r1',
    userId: 'u2',
    video: SAMPLE_VIDEO,
    caption: 'Little clip from the trip 🌍 #travel',
    timestamp: hoursAgo(8),
    likes: ['u1'],
    comments: [{ id: 'rc1', userId: 'u1', text: 'So cool!', timestamp: hoursAgo(7) }],
  },
  {
    id: 'r2',
    userId: 'u3',
    video: SAMPLE_VIDEO,
    caption: 'Quick demo of the new feature 💻 #tech',
    timestamp: daysAgo(1),
    likes: ['u1', 'u2'],
    comments: [],
  },
];

const DEMO_NOTIFICATIONS = [
  { id: 'n1', toUserId: 'u1', fromUserId: 'u2', type: 'like', postId: 'p3', timestamp: hoursAgo(1), read: false },
  { id: 'n2', toUserId: 'u1', fromUserId: 'u3', type: 'follow', timestamp: hoursAgo(3), read: false },
  { id: 'n3', toUserId: 'u1', fromUserId: 'u2', type: 'comment', postId: 'p3', text: 'Welcome to the app!', timestamp: hoursAgo(5), read: true },
];

const DEMO_MESSAGES = {
  'u1-u2': [
    { id: 'm1', senderId: 'u2', text: 'Hey, how are you?', timestamp: hoursAgo(2) },
    { id: 'm2', senderId: 'u1', text: 'Doing great! Just checking out this app.', timestamp: hoursAgo(2) },
  ],
};

/** Seeds IndexedDB exactly once (idempotent, single-owner init). */
export const seedDemoData = async () => {
  if (getStorage(STORAGE_KEYS.SEEDED)) return;

  setStorage(STORAGE_KEYS.USERS, DEMO_USERS);
  setStorage(STORAGE_KEYS.POSTS, DEMO_POSTS);
  setStorage(STORAGE_KEYS.STORIES, DEMO_STORIES);
  setStorage(STORAGE_KEYS.REELS, DEMO_REELS);
  setStorage(STORAGE_KEYS.NOTIFICATIONS, DEMO_NOTIFICATIONS);
  setStorage(STORAGE_KEYS.MESSAGES, DEMO_MESSAGES);
  setStorage(STORAGE_KEYS.SAVES, {});
  setStorage(STORAGE_KEYS.STORY_VIEWS, {});
  setStorage(STORAGE_KEYS.SEEDED, true);
};
