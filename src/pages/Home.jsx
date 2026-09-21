import { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { AppContext } from '../context/AppContext';
import Layout from '../components/layout/Layout';
import StoryTray from '../components/stories/StoryTray';
import PostCard from '../components/post/PostCard';
import EmptyState from '../components/common/EmptyState';
import { SkeletonPostCard, SkeletonStories } from '../components/common/Skeleton';
import Avatar from '../components/common/Avatar';

export default function Home() {
  const { user, users, toggleFollow } = useContext(AuthContext);
  const { dataLoading, getFeedPosts } = useContext(AppContext);

  const feedPosts = getFeedPosts();
  const suggestions = users.filter((u) => u.id !== user.id && !user.following.includes(u.id)).slice(0, 5);

  return (
    <Layout>
      <div className="feed-wrapper">
        <div className="feed-column">
          {dataLoading ? <SkeletonStories /> : <StoryTray />}

          {dataLoading ? (
            <>
              <SkeletonPostCard />
              <SkeletonPostCard />
            </>
          ) : feedPosts.length > 0 ? (
            feedPosts.map((post) => <PostCard key={post.id} post={post} />)
          ) : (
            <EmptyState
              icon="🏠"
              title="No posts yet"
              message="Follow people to see their posts here, or share your first post."
              action={
                <Link to="/create" className="btn btn-primary btn-sm">
                  Create a post
                </Link>
              }
            />
          )}
        </div>

        <aside className="suggestions-panel">
          <div className="suggestions-user">
            <Avatar src={user.avatar} name={user.fullName} size="md" />
            <div>
              <h5>{user.username}</h5>
              <p>{user.fullName}</p>
            </div>
          </div>

          {suggestions.length > 0 && (
            <>
              <div className="suggestions-title">Suggested for you</div>
              {suggestions.map((s) => (
                <div key={s.id} className="suggestion-item">
                  <Link to={`/profile/${s.username}`} className="suggestion-user">
                    <Avatar src={s.avatar} name={s.fullName} size="sm" />
                    <div className="suggestion-user-info">
                      <h5>{s.username}</h5>
                      <p>{s.fullName}</p>
                    </div>
                  </Link>
                  <button className="follow-btn" onClick={() => toggleFollow(s.id)}>
                    Follow
                  </button>
                </div>
              ))}
            </>
          )}
        </aside>
      </div>
    </Layout>
  );
}
