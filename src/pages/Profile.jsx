import { useContext, useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { AppContext } from '../context/AppContext';
import { ToastContext } from '../context/ToastContext';
import Layout from '../components/layout/Layout';
import Avatar from '../components/common/Avatar';
import Modal from '../components/common/Modal';
import Button from '../components/common/Button';
import FormInput from '../components/common/FormInput';
import EmptyState from '../components/common/EmptyState';
import { SkeletonGrid } from '../components/common/Skeleton';
import { formatCount } from '../utils/format';
import { validateProfile, hasErrors } from '../utils/validation';
import { buildMediaDescriptor } from '../utils/media';

export default function Profile() {
  const { username } = useParams();
  const { user: currentUser, getUserByUsername, updateProfile, toggleFollow, isFollowing } = useContext(AuthContext);
  const { dataLoading, getUserPosts } = useContext(AppContext);
  const { showToast } = useContext(ToastContext) || {};

  const profileUser = getUserByUsername(username);
  const isOwnProfile = profileUser && profileUser.id === currentUser.id;
  const following = profileUser ? isFollowing(profileUser.id) : false;

  const [showEditModal, setShowEditModal] = useState(false);
  const [editData, setEditData] = useState({ fullName: '', bio: '', website: '' });
  const [editErrors, setEditErrors] = useState({});
  const [avatarPreview, setAvatarPreview] = useState(null);

  useEffect(() => {
    if (profileUser) {
      setEditData({
        fullName: profileUser.fullName || '',
        bio: profileUser.bio || '',
        website: profileUser.website || '',
      });
      setAvatarPreview(profileUser.avatar || null);
    }
  }, [profileUser?.id]);

  if (!dataLoading && !profileUser) {
    return (
      <Layout>
        <EmptyState
          icon="🔎"
          title="User not found"
          message={`We couldn't find anyone at @${username}.`}
          action={
            <Link to="/" className="btn btn-primary btn-sm">
              Back Home
            </Link>
          }
        />
      </Layout>
    );
  }

  if (!profileUser) {
    return (
      <Layout>
        <div className="page-wide">
          <SkeletonGrid count={9} />
        </div>
      </Layout>
    );
  }

  const posts = getUserPosts(profileUser.id);

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const descriptor = await buildMediaDescriptor(file);
      if (descriptor.type !== 'image') throw new Error('Please choose an image for your profile picture.');
      setAvatarPreview(descriptor.url);
    } catch (err) {
      showToast?.(err.message, { type: 'error' });
    }
  };

  const handleSaveProfile = (e) => {
    e.preventDefault();
    const errors = validateProfile(editData);
    setEditErrors(errors);
    if (hasErrors(errors)) return;
    updateProfile({ ...editData, avatar: avatarPreview });
    setShowEditModal(false);
    showToast?.('Profile updated', { type: 'success' });
  };

  return (
    <Layout>
      <div className="page-wide">
        <div className="profile-header">
          <Avatar src={profileUser.avatar} name={profileUser.fullName} size="xxl" />

          <div className="profile-header-info">
            <div className="profile-title-row">
              <h1>{profileUser.username}</h1>
              {isOwnProfile ? (
                <Button variant="secondary" size="sm" onClick={() => setShowEditModal(true)}>
                  Edit Profile
                </Button>
              ) : (
                <Button variant={following ? 'secondary' : 'primary'} size="sm" onClick={() => toggleFollow(profileUser.id)}>
                  {following ? 'Following' : 'Follow'}
                </Button>
              )}
            </div>

            <div className="profile-stats">
              <div><strong>{formatCount(posts.length)}</strong> posts</div>
              <div><strong>{formatCount(profileUser.followers.length)}</strong> followers</div>
              <div><strong>{formatCount(profileUser.following.length)}</strong> following</div>
            </div>

            <h3 className="profile-fullname">{profileUser.fullName}</h3>
            {profileUser.bio && <p className="profile-bio">{profileUser.bio}</p>}
            {profileUser.website && (
              <a href={profileUser.website} target="_blank" rel="noopener noreferrer" className="profile-website">
                {profileUser.website.replace(/^https?:\/\//, '')}
              </a>
            )}
          </div>
        </div>

        <div className="profile-posts">
          <h3>Posts</h3>
          {dataLoading ? (
            <SkeletonGrid count={6} />
          ) : posts.length > 0 ? (
            <div className="grid-3">
              {posts.map((post) => (
                <Link key={post.id} to={`/?post=${post.id}`} className="grid-tile">
                  {post.media[0]?.type === 'video' ? (
                    <video src={post.media[0].url} muted />
                  ) : (
                    <img src={post.media[0]?.url} alt={post.caption || 'Post'} />
                  )}
                  {post.media.length > 1 && <span className="grid-tile-multi" aria-hidden="true">📷</span>}
                </Link>
              ))}
            </div>
          ) : (
            <EmptyState icon="📷" title="No posts yet" message={isOwnProfile ? 'Share your first photo or video.' : ''} />
          )}
        </div>
      </div>

      <Modal isOpen={showEditModal} onClose={() => setShowEditModal(false)} title="Edit Profile">
        <form onSubmit={handleSaveProfile} noValidate>
          <div className="edit-avatar-row">
            <Avatar src={avatarPreview} name={editData.fullName} size="lg" />
            <label className="btn btn-secondary btn-sm file-label">
              Change photo
              <input type="file" accept="image/*" hidden onChange={handleAvatarChange} />
            </label>
          </div>

          <FormInput
            label="Full Name"
            value={editData.fullName}
            onChange={(e) => setEditData({ ...editData, fullName: e.target.value })}
            error={editErrors.fullName}
          />
          <FormInput
            as="textarea"
            label="Bio"
            value={editData.bio}
            onChange={(e) => setEditData({ ...editData, bio: e.target.value })}
            error={editErrors.bio}
            maxLength={150}
            style={{ minHeight: 80 }}
            hint={`${editData.bio.length}/150`}
          />
          <FormInput
            label="Website"
            value={editData.website}
            onChange={(e) => setEditData({ ...editData, website: e.target.value })}
            error={editErrors.website}
            placeholder="https://example.com"
          />

          <div className="modal-actions">
            <Button type="button" variant="secondary" onClick={() => setShowEditModal(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Save Changes
            </Button>
          </div>
        </form>
      </Modal>
    </Layout>
  );
}
