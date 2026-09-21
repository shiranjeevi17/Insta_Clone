import { useContext, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { AppContext } from '../context/AppContext';
import Layout from '../components/layout/Layout';
import Avatar from '../components/common/Avatar';
import EmptyState from '../components/common/EmptyState';
import { SkeletonList } from '../components/common/Skeleton';
import { timeAgo } from '../utils/format';

const MESSAGE_BY_TYPE = {
  like: 'liked your post.',
  comment: 'commented on your post.',
  follow: 'started following you.',
};

export default function Notifications() {
  const { getUserById } = useContext(AuthContext);
  const { dataLoading, getMyNotifications, markAllNotificationsRead, markNotificationRead } = useContext(AppContext);

  const notifications = getMyNotifications();

  useEffect(() => {
    if (notifications.some((n) => !n.read)) {
      const timer = setTimeout(markAllNotificationsRead, 1200);
      return () => clearTimeout(timer);
    }
    return undefined;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [notifications.length]);

  return (
    <Layout>
      <div className="page-narrow">
        <h2>Notifications</h2>

        {dataLoading ? (
          <SkeletonList count={5} />
        ) : notifications.length === 0 ? (
          <EmptyState icon="🔔" title="No notifications yet" message="When people like, comment or follow you, you'll see it here." />
        ) : (
          <div className="notifications-list">
            {notifications.map((notif) => {
              const fromUser = getUserById(notif.fromUserId);
              if (!fromUser) return null;
              const target = notif.postId ? `/?post=${notif.postId}` : `/profile/${fromUser.username}`;
              return (
                <Link
                  key={notif.id}
                  to={target}
                  className={`notification-item ${!notif.read ? 'unread' : ''}`}
                  onClick={() => markNotificationRead(notif.id)}
                >
                  <Avatar src={fromUser.avatar} name={fromUser.fullName} size="md" />
                  <div className="notification-text">
                    <span>
                      <strong>{fromUser.username}</strong>{' '}
                      {notif.type === 'comment' && notif.text ? `commented: "${notif.text}"` : MESSAGE_BY_TYPE[notif.type] || 'interacted with your content.'}
                    </span>
                    <span className="notification-time">{timeAgo(notif.timestamp)}</span>
                  </div>
                  {!notif.read && <span className="notification-dot" aria-hidden="true" />}
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </Layout>
  );
}
