import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import type { Post, User } from '../types';
import {
  deletePost,
  followUser,
  getPosts,
  getUserById,
  getUserFollowers,
  unfollowUser,
} from '../services/api';
import { useAuth } from '../context/AuthContext';
import { PostCard } from '../components/PostCard';

type ViewMode = 'grid' | 'feed';

export const Profile = () => {
  const { userId: paramUserId } = useParams<{ userId?: string }>();
  const { user: currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const targetUserId = paramUserId || currentUser?.id || '';
  const isOwnProfile = Boolean(currentUser && targetUserId === currentUser.id);

  const [profileUser, setProfileUser] = useState<User | null>(
    isOwnProfile ? currentUser : null
  );
  const [userPosts, setUserPosts] = useState<Post[]>([]);
  const [followers, setFollowers] = useState<User[]>([]);
  const [followLoading, setFollowLoading] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadProfileData = async () => {
    if (!targetUserId || !currentUser) return;
    try {
      setLoading(true);
      setError(null);

      const [loadedUser, posts, loadedFollowers] = await Promise.all([
        isOwnProfile ? Promise.resolve(currentUser) : getUserById(targetUserId),
        getPosts(targetUserId),
        getUserFollowers(targetUserId).catch(() => [] as User[]),
      ]);

      setProfileUser(loadedUser);
      setUserPosts(posts);
      setFollowers(loadedFollowers);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'No se pudo cargar el perfil y sus publicaciones.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadProfileData();
  }, [targetUserId, currentUser?.id]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleDeletePost = async (postId: string) => {
    try {
      await deletePost(postId);
      setUserPosts((prev) => prev.filter((p) => p.id !== postId));
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'No se pudo eliminar la publicación.'
      );
    }
  };

  const isFollowing = Boolean(
    currentUser && followers.some((f) => String(f.id) === String(currentUser.id))
  );

  const handleToggleFollow = async () => {
    if (!currentUser || !profileUser || isOwnProfile) return;
    try {
      setFollowLoading(true);
      if (isFollowing) {
        await unfollowUser(profileUser.id, currentUser.id);
        setFollowers((prev) => prev.filter((f) => String(f.id) !== String(currentUser.id)));
      } else {
        await followUser(profileUser.id, currentUser.id);
        setFollowers((prev) => [...prev, currentUser]);
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'No se pudo actualizar el seguimiento.'
      );
    } finally {
      setFollowLoading(false);
    }
  };

  if (!currentUser) return null;

  const displayedUser = profileUser ?? (isOwnProfile ? currentUser : null);

  const totalVisibleComments = userPosts.reduce(
    (acc, post) =>
      acc + (post.comments?.filter((c) => c.visible !== false).length ?? 0),
    0
  );

  return (
    <div className="container py-4">
      {!isOwnProfile && (
        <div className="mb-3 d-flex justify-content-between align-items-center">
          <Link to="/" className="btn btn-outline-secondary btn-sm rounded-pill px-3">
            <i className="bi bi-arrow-left me-1"></i> Volver al Feed
          </Link>
          <Link to="/profile" className="btn btn-outline-info btn-sm rounded-pill px-3">
            <i className="bi bi-person-circle me-1"></i> Ir a mi Perfil
          </Link>
        </div>
      )}

      {/* Cabecera estilo red social */}
      <section className="card bg-dark border-secondary border-opacity-25 rounded-4 shadow-lg mb-4 overflow-hidden">
        <div className="p-4 p-md-5 profile-header-bg">
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-4">
            <div className="d-flex align-items-center gap-4">
              <div className="bg-info text-dark rounded-circle d-flex align-items-center justify-content-center fw-bold fs-2 flex-shrink-0 shadow profile-avatar-lg">
                {(displayedUser?.nickName || '?').charAt(0).toUpperCase()}
              </div>
              <div>
                <span className="badge bg-info bg-opacity-10 text-info border border-info border-opacity-25 mb-2">
                  {isOwnProfile ? 'Tu Perfil' : 'Perfil de Usuario'}
                </span>
                <h2 className="fw-bold mb-1">
                  @{displayedUser?.nickName || 'usuario'}
                </h2>
                <div className="d-flex flex-wrap align-items-center gap-4 mt-2">
                  <div>
                    <strong className="fs-5 text-info me-1">{userPosts.length}</strong>
                    <span className="text-secondary small">
                      {userPosts.length === 1 ? 'publicación' : 'publicaciones'}
                    </span>
                  </div>
                  <div>
                    <strong className="fs-5 text-info me-1">{followers.length}</strong>
                    <span className="text-secondary small">
                      {followers.length === 1 ? 'seguidor' : 'seguidores'}
                    </span>
                  </div>
                  <div>
                    <strong className="fs-5 text-info me-1">{totalVisibleComments}</strong>
                    <span className="text-secondary small">comentarios recibidos</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="d-flex flex-wrap gap-2">
              {isOwnProfile ? (
                <>
                  <Link
                    to="/create-post"
                    className="btn btn-info text-dark fw-bold px-3"
                  >
                    <i className="bi bi-plus-circle me-1"></i>
                    Nueva Publicación
                  </Link>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="btn btn-outline-danger px-3"
                  >
                    <i className="bi bi-box-arrow-right me-1"></i>
                    Cerrar Sesión
                  </button>
                </>
              ) : (
                displayedUser && (
                  <button
                    type="button"
                    onClick={handleToggleFollow}
                    disabled={followLoading}
                    className={`btn fw-bold px-4 rounded-pill ${
                      isFollowing ? 'btn-outline-secondary' : 'btn-info'
                    }`}
                  >
                    <i
                      className={`bi ${
                        isFollowing ? 'bi-person-check-fill' : 'bi-person-plus-fill'
                      } me-1`}
                    ></i>
                    {followLoading
                      ? 'Actualizando...'
                      : isFollowing
                        ? 'Siguiendo'
                        : 'Seguir'}
                  </button>
                )
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Barra de pestaña Publicaciones + selector Cuadrícula / Feed */}
      <section>
        <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 pb-3 mb-4 border-bottom border-secondary border-opacity-25">
          <div className="d-flex align-items-center gap-2">
            <h4 className="fw-bold mb-0 d-flex align-items-center gap-2">
              <i className="bi bi-grid-3x3-gap-fill text-info"></i>
              {isOwnProfile
                ? `Mis Publicaciones (${userPosts.length})`
                : `Publicaciones de @${displayedUser?.nickName || 'usuario'} (${userPosts.length})`}
            </h4>
          </div>

          <div className="d-flex align-items-center gap-2">
            <div className="btn-group btn-group-sm" role="group" aria-label="Modo de vista">
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={`btn ${
                  viewMode === 'grid' ? 'btn-info fw-semibold' : 'btn-outline-secondary'
                }`}
                title="Vista en cuadrícula"
              >
                <i className="bi bi-grid-3x3-gap me-1"></i> Cuadrícula
              </button>
              <button
                type="button"
                onClick={() => setViewMode('feed')}
                className={`btn ${
                  viewMode === 'feed' ? 'btn-info fw-semibold' : 'btn-outline-secondary'
                }`}
                title="Vista en muro vertical"
              >
                <i className="bi bi-view-stacked me-1"></i> Muro
              </button>
            </div>

            <button
              type="button"
              onClick={loadProfileData}
              className="btn btn-outline-secondary btn-sm"
              disabled={loading}
              title="Actualizar publicaciones"
            >
              <i className="bi bi-arrow-clockwise"></i>
            </button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-info mb-3" role="status">
              <span className="visually-hidden">Cargando publicaciones...</span>
            </div>
            <p className="text-secondary">Consultando publicaciones del usuario...</p>
          </div>
        ) : error ? (
          <div className="alert alert-danger rounded-4 p-4">
            <h5 className="fw-bold mb-1">
              <i className="bi bi-exclamation-triangle me-2"></i>Error al cargar publicaciones
            </h5>
            <p className="small mb-2">{error}</p>
            <button
              type="button"
              onClick={loadProfileData}
              className="btn btn-outline-danger btn-sm"
            >
              Reintentar
            </button>
          </div>
        ) : userPosts.length === 0 ? (
          <div className="card bg-dark border-secondary border-opacity-25 rounded-4 p-5 text-center">
            <i className="bi bi-camera text-info display-4 mb-3"></i>
            <h4 className="fw-bold">
              {isOwnProfile
                ? 'Todavía no hiciste publicaciones'
                : `@${displayedUser?.nickName || 'Este usuario'} todavía no publicó nada`}
            </h4>
            <p className="text-secondary mb-4">
              {isOwnProfile
                ? '¡Compartí tu primer posteo con la comunidad de UnaHur Anti-Social Net!'
                : 'Cuando comparta publicaciones aparecerán en este muro.'}
            </p>
            {isOwnProfile && (
              <div>
                <Link to="/create-post" className="btn btn-info text-dark fw-bold px-4">
                  <i className="bi bi-plus-lg me-1"></i> Crear mi primera publicación
                </Link>
              </div>
            )}
          </div>
        ) : viewMode === 'grid' ? (
          <div className="row g-4">
            {userPosts.map((post) => (
              <div key={post.id} className="col-12 col-md-6 col-lg-4">
                <PostCard
                  post={post}
                  onDelete={isOwnProfile ? handleDeletePost : undefined}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="row justify-content-center">
            <div className="col-12 col-lg-8 d-flex flex-column gap-4">
              {userPosts.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  onDelete={isOwnProfile ? handleDeletePost : undefined}
                />
              ))}
            </div>
          </div>
        )}
      </section>
    </div>
  );
};
