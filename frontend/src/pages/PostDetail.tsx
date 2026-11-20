import { useEffect, useState, type ChangeEvent, type FormEvent } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import type { Post } from '../types';
import { createComment, deletePost, getPostById, uploadPostImageFile } from '../services/api';
import { useAuth } from '../context/AuthContext';

export const PostDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Estado controlado para el formulario de nuevo comentario (useState)
  const [commentText, setCommentText] = useState('');
  const [commentError, setCommentError] = useState<string | null>(null);
  const [commentSuccess, setCommentSuccess] = useState<string | null>(null);
  const [submittingComment, setSubmittingComment] = useState(false);

  const fetchPost = async () => {
    if (!id) return;
    try {
      setLoading(true);
      setError(null);
      const data = await getPostById(id);
      setPost(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'No se pudo cargar el detalle de la publicación.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchPost();
  }, [id]);

  const handleCommentSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setCommentError(null);
    setCommentSuccess(null);

    if (!commentText.trim()) {
      setCommentError('El comentario es un campo obligatorio y no puede estar vacío.');
      return;
    }

    if (!isAuthenticated || !user || !id) {
      setCommentError('Debés iniciar sesión para poder comentar en esta publicación.');
      return;
    }

    try {
      setSubmittingComment(true);
      await createComment({
        postId: id,
        userId: user.id,
        content: commentText.trim(),
      });

      setCommentText('');
      setCommentSuccess('¡Comentario publicado correctamente!');
      await fetchPost();
    } catch (err) {
      setCommentError(
        err instanceof Error ? err.message : 'No se pudo enviar el comentario.'
      );
    } finally {
      setSubmittingComment(false);
    }
  };

  if (loading) {
    return (
      <div className="container py-5 text-center my-auto">
        <div className="spinner-border text-info mb-3" role="status">
          <span className="visually-hidden">Cargando publicación...</span>
        </div>
        <p className="text-secondary">Cargando detalle de la publicación...</p>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="container py-5">
        <div className="alert alert-danger rounded-4 p-4">
          <h4 className="alert-heading fw-bold">
            <i className="bi bi-exclamation-triangle me-2"></i>
            Error al cargar la publicación
          </h4>
          <p className="mb-3">{error || 'La publicación solicitada no existe.'}</p>
          <Link to="/" className="btn btn-outline-light btn-sm">
            <i className="bi bi-arrow-left me-1"></i> Volver al Inicio
          </Link>
        </div>
      </div>
    );
  }

  const visibleComments = post.comments?.filter((c) => c.visible !== false) ?? [];
  const isOwner = Boolean(
    isAuthenticated &&
      user &&
      (post.userId === user.id || post.user?.id === user.id)
  );

  const handleDeleteCurrentPost = async () => {
    if (!post) return;
    try {
      await deletePost(post.id);
      navigate('/profile');
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'No se pudo eliminar la publicación.'
      );
    }
  };

  const handleAddImageToPost = async (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!post || !files || files.length === 0) return;
    try {
      for (const file of Array.from(files)) {
        await uploadPostImageFile(post.id, file);
      }
      e.target.value = '';
      await fetchPost();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'No se pudo subir la imagen a la publicación.'
      );
    }
  };

  const formattedPostDate = post.date
    ? new Date(post.date).toLocaleString('es-AR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : null;

  return (
    <div className="container py-4">
      <div className="mb-3">
        <Link to="/" className="btn btn-outline-secondary btn-sm rounded-pill px-3">
          <i className="bi bi-arrow-left me-1"></i> Volver al Feed
        </Link>
      </div>

      <div className="row g-4">
        {/* Columna principal: Detalle del post */}
        <div className="col-12 col-lg-7">
          <article className="card bg-dark border-secondary border-opacity-25 rounded-4 shadow-lg overflow-hidden">
            <div className="card-body p-4 p-md-5">
              <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3 pb-3 border-bottom border-secondary border-opacity-25">
                <div className="d-flex align-items-center gap-2">
                  <div className="bg-info bg-opacity-10 text-info rounded-circle d-flex align-items-center justify-content-center author-avatar-sm">
                    <i className="bi bi-person-fill fs-5"></i>
                  </div>
                  <div>
                    <h6 className="fw-bold text-info mb-0">
                      @{post.user?.nickName || 'usuario'}
                    </h6>
                    {formattedPostDate && (
                      <small className="text-secondary">{formattedPostDate}</small>
                    )}
                  </div>
                </div>

                <div className="d-flex align-items-center gap-2">
                  <span className="badge bg-secondary bg-opacity-25 text-secondary">
                    ID: {post.id.slice(-6)}
                  </span>
                  {isOwner && (
                    <>
                      <label className="btn btn-outline-info btn-sm mb-0">
                        <i className="bi bi-camera me-1"></i> Subir foto
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          className="d-none"
                          onChange={handleAddImageToPost}
                        />
                      </label>
                      <button
                        type="button"
                        onClick={handleDeleteCurrentPost}
                        className="btn btn-outline-danger btn-sm"
                      >
                        <i className="bi bi-trash me-1"></i> Eliminar
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Descripción completa */}
              <div className="mb-4">
                <p className="fs-5 text-light mb-0 text-preline">
                  {post.description}
                </p>
              </div>

              {/* Etiquetas */}
              {post.tags && post.tags.length > 0 && (
                <div className="mb-4">
                  <h6 className="text-secondary small text-uppercase fw-bold mb-2">
                    <i className="bi bi-tags me-1 text-info"></i> Etiquetas
                  </h6>
                  <div className="d-flex flex-wrap gap-2">
                    {post.tags.map((tag) => (
                      <span
                        key={tag.id || tag.name}
                        className="badge rounded-pill bg-info bg-opacity-10 text-info border border-info border-opacity-25 px-3 py-2"
                      >
                        #{tag.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Imágenes asociadas */}
              {post.images && post.images.length > 0 && (
                <div>
                  <h6 className="text-secondary small text-uppercase fw-bold mb-3">
                    <i className="bi bi-images me-1 text-info"></i> Imágenes ({post.images.length})
                  </h6>
                  <div className="row g-3">
                    {post.images.map((img, idx) => (
                      <div
                        key={img.id || idx}
                        className={post.images && post.images.length === 1 ? 'col-12' : 'col-12 col-sm-6'}
                      >
                        <div className="rounded-3 overflow-hidden border border-secondary border-opacity-25 bg-black">
                          <img
                            src={img.url}
                            alt={`Imagen ${idx + 1} del post`}
                            className="w-100 object-fit-cover post-detail-img"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </article>
        </div>

        {/* Columna lateral: Comentarios visibles + Formulario para agregar comentario */}
        <div className="col-12 col-lg-5">
          <section className="card bg-dark border-secondary border-opacity-25 rounded-4 shadow-lg">
            <div className="card-body p-4">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="fw-bold mb-0">
                  <i className="bi bi-chat-dots text-info me-2"></i>
                  Comentarios Visibles
                </h5>
                <span className="badge bg-info text-dark rounded-pill">
                  {visibleComments.length}
                </span>
              </div>

              {/* Formulario controlado para agregar comentario nuevo */}
              <div className="mb-4 pb-4 border-bottom border-secondary border-opacity-25">
                {isAuthenticated ? (
                  <form onSubmit={handleCommentSubmit} noValidate>
                    <label htmlFor="commentContent" className="form-label small fw-semibold text-secondary">
                      Agregar un comentario como <span className="text-info">@{user?.nickName}</span>{' '}
                      <span className="text-danger">*</span>
                    </label>

                    {commentError && (
                      <div className="alert alert-danger py-2 small" role="alert">
                        <i className="bi bi-exclamation-circle me-1"></i>
                        {commentError}
                      </div>
                    )}

                    {commentSuccess && (
                      <div className="alert alert-success py-2 small" role="alert">
                        <i className="bi bi-check-circle me-1"></i>
                        {commentSuccess}
                      </div>
                    )}

                    <textarea
                      id="commentContent"
                      rows={3}
                      className="form-control border-secondary border-opacity-50 mb-2"
                      placeholder="Escribí tu comentario..."
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      disabled={submittingComment}
                      required
                    />

                    <button
                      type="submit"
                      className="btn btn-info text-dark fw-bold btn-sm w-100 py-2"
                      disabled={submittingComment}
                    >
                      {submittingComment ? (
                        <>
                          <span
                            className="spinner-border spinner-border-sm me-2"
                            role="status"
                            aria-hidden="true"
                          ></span>
                          Publicando...
                        </>
                      ) : (
                        <>
                          <i className="bi bi-send-fill me-1"></i> Publicar Comentario
                        </>
                      )}
                    </button>
                  </form>
                ) : (
                  <div className="alert alert-secondary bg-body-tertiary border-secondary border-opacity-25 mb-0">
                    <p className="small mb-2 text-light">
                      <i className="bi bi-lock-fill text-info me-1"></i>
                      Iniciá sesión para dejar un comentario en esta publicación.
                    </p>
                    <Link to="/login" className="btn btn-info btn-sm text-dark fw-semibold">
                      Iniciar Sesión
                    </Link>
                  </div>
                )}
              </div>

              {/* Lista de comentarios visibles */}
              {visibleComments.length === 0 ? (
                <div className="text-center py-4 text-secondary">
                  <i className="bi bi-chat-square-Text fs-2 d-block mb-2"></i>
                  <p className="small mb-0">
                    Todavía no hay comentarios visibles en esta publicación.
                  </p>
                </div>
              ) : (
                <div className="d-flex flex-column gap-3">
                  {visibleComments.map((comment) => {
                    const commentDate = comment.date
                      ? new Date(comment.date).toLocaleDateString('es-AR', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })
                      : null;

                    return (
                      <div
                        key={comment.id}
                        className="p-3 rounded-3 bg-body-tertiary border border-secondary border-opacity-25"
                      >
                        <div className="d-flex justify-content-between align-items-center mb-1 small">
                          <span className="fw-bold text-info">
                            @{comment.user?.nickName || 'usuario'}
                          </span>
                          {commentDate && (
                            <span className="text-secondary">{commentDate}</span>
                          )}
                        </div>
                        <p className="mb-0 text-light small text-preline">
                          {comment.content}
                        </p>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

