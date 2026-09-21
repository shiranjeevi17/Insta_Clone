import { useContext, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { AppContext } from '../context/AppContext';
import Layout from '../components/layout/Layout';
import Avatar from '../components/common/Avatar';
import EmptyState from '../components/common/EmptyState';

export default function Search() {
  const [searchParams] = useSearchParams();
  const { users } = useContext(AuthContext);
  const { posts, dataLoading } = useContext(AppContext);
  const query = (searchParams.get('q') || '').trim();

  const results = useMemo(() => {
    if (!query) return { users: [], posts: [] };
    const q = query.toLowerCase();
    return {
      users: users.filter((u) => u.username.toLowerCase().includes(q) || u.fullName.toLowerCase().includes(q)),
      posts: posts.filter((p) => p.caption.toLowerCase().includes(q)),
    };
  }, [query, users, posts]);

  const hasQuery = query.length > 0;
  const hasResults = results.users.length > 0 || results.posts.length > 0;

  return (
    <Layout>
      <div className="page-narrow">
        <h2>{hasQuery ? `Results for "${query}"` : 'Search'}</h2>

        {!hasQuery ? (
          <EmptyState icon="🔍" title="Search InstaClone" message="Find people and posts by username, name or caption." />
        ) : dataLoading ? (
          <p className="text-secondary">Searching…</p>
        ) : !hasResults ? (
          <EmptyState icon="🔍" title="No results found" message={`Nothing matched "${query}".`} />
        ) : (
          <>
            {results.users.length > 0 && (
              <section className="search-section">
                <h3>Users</h3>
                {results.users.map((u) => (
                  <Link key={u.id} to={`/profile/${u.username}`} className="search-result-card">
                    <Avatar src={u.avatar} name={u.fullName} size="md" />
                    <div>
                      <h4>{u.username}</h4>
                      <p>{u.fullName}</p>
                    </div>
                  </Link>
                ))}
              </section>
            )}

            {results.posts.length > 0 && (
              <section className="search-section">
                <h3>Posts</h3>
                <div className="grid-3">
                  {results.posts.map((post) => (
                    <Link key={post.id} to={`/?post=${post.id}`} className="grid-tile">
                      {post.media[0]?.type === 'video' ? (
                        <video src={post.media[0].url} muted />
                      ) : (
                        <img src={post.media[0]?.url} alt={post.caption || 'Post'} />
                      )}
                    </Link>
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </div>
    </Layout>
  );
}
