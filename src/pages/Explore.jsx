import { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import Layout from '../components/layout/Layout';
import EmptyState from '../components/common/EmptyState';
import { SkeletonGrid } from '../components/common/Skeleton';
import { formatCount } from '../utils/format';

export default function Explore() {
  const { dataLoading, getExplorePosts } = useContext(AppContext);
  const posts = getExplorePosts();

  return (
    <Layout>
      <div className="page-wide">
        <h2>Explore</h2>

        {dataLoading ? (
          <SkeletonGrid count={9} />
        ) : posts.length === 0 ? (
          <EmptyState icon="🌍" title="No posts to explore yet" message="Once people start posting, popular content will show up here." />
        ) : (
          <div className="grid-3">
            {posts.map((post) => {
              const cover = post.media[0];
              return (
                <Link key={post.id} to={`/?post=${post.id}`} className="grid-tile explore-tile">
                  {!cover ? (
                    <div className="media-broken"><span aria-hidden="true">🖼️</span></div>
                  ) : cover.type === 'video' ? (
                    <video src={cover.url} muted />
                  ) : (
                    <img src={cover.url} alt={post.caption || 'Post'} />
                  )}
                  <div className="explore-tile-overlay">
                    <span aria-hidden="true">❤️ {formatCount(post.likes.length)}</span>
                    <span aria-hidden="true">💬 {formatCount(post.comments.length)}</span>
                  </div>
                  {post.media.length > 1 && <span className="grid-tile-multi" aria-hidden="true">📷</span>}
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </Layout>
  );
}
