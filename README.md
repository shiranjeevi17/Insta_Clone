# InstaClone

An Instagram-inspired social app front end, built with **React 19 + Vite + Context API**. Frontend-only — all data lives in the browser's `localStorage`, no backend required.

## Getting started

```bash
npm install
npm run dev       # start the dev server (usually http://localhost:5173)
npm run build      # production build → dist/
npm run preview    # preview the production build locally
```

## Demo account

- **Email:** `demo@example.com`
- **Password:** `demo123`

Or click **"🎭 Try Demo Account"** on the login screen, or sign up for a new account.

## What's here

- **Auth** — login, signup, protected routes, persistent session
- **Feed** — posts with real photo/video uploads, likes, comments, saves, delete, share-link
- **Stories** — real image/video stories with a full-screen viewer (progress bars, autoplay, mute, pause, 24h expiry)
- **Reels** — vertical, swipeable real `<video>` feed with like/comment/mute, plus a real upload flow
- **Profile** — edit profile (name/bio/website/avatar), follow/unfollow, post grid
- **Search / Explore / Saved / Notifications / Messages / Settings**
- Dark/light theme, toasts, loading skeletons, empty states, and a 404 page

## Architecture

- `src/context/AuthContext.jsx` — users, session, follow/unfollow
- `src/context/AppContext.jsx` — posts, stories, reels, saves, notifications, messages
- `src/context/ThemeContext.jsx`, `src/context/ToastContext.jsx`
- `src/utils/storage.js` — the only place that touches `localStorage`
- `src/utils/media.js` — real file validation + base64/object-URL conversion for uploads
- `src/data/seed.js` — one-time demo data seed
- `src/components/common/` — shared building blocks (Button, Modal, Avatar, Toast, MediaUploader, etc.)
- `src/styles/app.css` — single stylesheet for the whole app

## Notes

This is a frontend-only demo, so large videos can't be reliably persisted in `localStorage`; big video uploads are kept in memory for the current session (see the in-app note in the final report / on the media uploader) and would need real backend/cloud storage to persist permanently.
