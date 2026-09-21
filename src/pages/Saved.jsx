import { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import Layout from '../components/layout/Layout';
import EmptyState from '../components/common/EmptyState';
import { SkeletonGrid } from '../components/common/Skeleton';

export default function Saved() {
  const { dataLoading, getSavedPosts } = useContext(AppContext);
  const savedPosts = getSavedPosts();

  return (
    <Layout>
      <div className="page-wide">
        <h2>Saved Posts</h2>

        {dataLoading ? (
          <SkeletonGrid count={6} />
        ) : savedPosts.length === 0 ? (
          <EmptyState icon="🔖" title="No saved posts yet" message="Tap the bookmark icon on any post to save it for later." />
        ) : (
          <div className="grid-3">
            {savedPosts.map((post) => {
              const cover = post.media[0];
              return (
                <Link key={post.id} to={`/?post=${post.id}`} className="grid-tile">
                  {cover?.type === 'video' ? <video src={cover.url} muted /> : <img src={cover?.url} alt={post.caption || 'Saved post'} />}
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
