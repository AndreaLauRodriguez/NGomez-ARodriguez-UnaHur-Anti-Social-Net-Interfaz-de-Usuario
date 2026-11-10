import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import type { Post } from '../types';
import { deletePost, getPosts } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { PostCard } from '../components/PostCard';

export const Profile = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [userPosts, setUserPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadUserPosts = async () => {
    if (!user) return;
    try {
      setLoading(true);
      setError(null);
      const posts = await getPosts(user.id);
      setUserPosts(posts);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'No se pudieron obtener tus publicaciones.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadUserPosts();
  }, [user?.id]);

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

  if (!user) return null;

  const totalVisibleComments = userPosts.reduce(
    (acc, post) =>
      acc + (post.comments?.filter((c) => c.visible !== false).length ?? 0),
    0
  );

  return (
    <div className="container py-4">
      {/* Cabecera de Perfil de Usuario */}
      <section className="card bg-dark border-secondary border-opacity-25 rounded-4 shadow-lg mb-5 overflow-hidden">
        <div className="p-4 p-md-5 profile-header-bg">
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-4">
            <div className="d-flex align-items-center gap-3">
              <div className="bg-info text-dark rounded-circle d-flex align-items-center justify-content-center fw-bold fs-2 flex-shrink-0 shadow profile-avatar-lg">
                {user.nickName.charAt(0).toUpperCase()}
              </div>
              <div>
                <span className="badge bg-info bg-opacity-10 text-info border border-info border-opacity-25 mb-1">
                  Perfil de Usuario
                </span>
                <h2 className="fw-bold mb-1 text-white">@{user.nickName}</h2>
                <p className="text-secondary small mb-0">
                  ID de usuario: <code>{user.id}</code>
                </p>
              </div>
            </div>

            <div className="d-flex flex-wrap gap-2">
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
            </div>
          </div>

          <div className="row g-3 mt-4 pt-3 border-top border-secondary border-opacity-25">
            <div className="col-6 col-sm-4 col-md-3">
              <div className="p-3 rounded-3 bg-black bg-opacity-25 border border-secondary border-opacity-25">
                <span className="text-secondary small d-block">Mis Publicaciones</span>
                <strong className="fs-4 text-info">{userPosts.length}</strong>
              </div>
            </div>
            <div className="col-6 col-sm-4 col-md-3">
              <div className="p-3 rounded-3 bg-black bg-opacity-25 border border-secondary border-opacity-25">
                <span className="text-secondary small d-block">Comentarios Recibidos</span>
                <strong className="fs-4 text-info">{totalVisibleComments}</strong>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Lista de publicaciones realizadas por el usuario */}
      <section>
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h3 className="fw-bold mb-0">
            <i className="bi bi-journal-richtext text-info me-2"></i>
            Mis Publicaciones ({userPosts.length})
          </h3>
          <button
            type="button"
            onClick={loadUserPosts}
            className="btn btn-outline-secondary btn-sm"
            disabled={loading}
          >
            <i className="bi bi-arrow-clockwise me-1"></i> Actualizar
          </button>
        </div>

        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-info mb-3" role="status">
              <span className="visually-hidden">Cargando tus publicaciones...</span>
            </div>
            <p className="text-secondary">Consultando tus publicaciones...</p>
          </div>
        ) : error ? (
          <div className="alert alert-danger rounded-4 p-4">
            <h5 className="fw-bold mb-1">
              <i className="bi bi-exclamation-triangle me-2"></i>Error al cargar publicaciones
            </h5>
            <p className="small mb-2">{error}</p>
            <button
              type="button"
              onClick={loadUserPosts}
              className="btn btn-outline-danger btn-sm"
            >
              Reintentar
            </button>
          </div>
        ) : userPosts.length === 0 ? (
          <div className="card bg-dark border-secondary border-opacity-25 rounded-4 p-5 text-center">
            <i className="bi bi-pencil-square text-info display-4 mb-3"></i>
            <h4 className="fw-bold">Todavía no hiciste publicaciones</h4>
            <p className="text-secondary mb-4">
              ¡Compartí tu primer posteo con la comunidad de UnaHur Anti-Social Net!
            </p>
            <div>
              <Link to="/create-post" className="btn btn-info text-dark fw-bold px-4">
                <i className="bi bi-plus-lg me-1"></i> Crear mi primera publicación
              </Link>
            </div>
          </div>
        ) : (
          <div className="row g-4">
            {userPosts.map((post) => (
              <div key={post.id} className="col-12 col-md-6 col-lg-4">
                <PostCard post={post} onDelete={handleDeletePost} />
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

