import { Link } from 'react-router-dom';
import type { Post } from '../types';

interface PostCardProps {
  post: Post;
  onSelectTag?: (tagName: string) => void;
  selectedTag?: string | null;
  onDelete?: (postId: string) => void;
}

export const PostCard = ({
  post,
  onSelectTag,
  selectedTag,
  onDelete,
}: PostCardProps) => {
  const visibleCommentsCount =
    post.comments?.filter((c) => c.visible !== false).length ?? 0;

  const formattedDate = post.date
    ? new Date(post.date).toLocaleDateString('es-AR', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      })
    : null;

  const firstImage = post.images && post.images.length > 0 ? post.images[0].url : null;
  const extraImagesCount =
    post.images && post.images.length > 1 ? post.images.length - 1 : 0;

  return (
    <article className="card bg-dark border-secondary border-opacity-25 shadow-sm rounded-4 h-100 card-hover overflow-hidden">
      {firstImage && (
        <div className="position-relative bg-black post-card-img-container">
          <img
            src={firstImage}
            alt="Imagen de la publicación"
            className="w-100 h-100 object-fit-cover"
          />
          {extraImagesCount > 0 && (
            <span className="position-absolute bottom-0 end-0 m-2 badge bg-dark bg-opacity-75 border border-secondary">
              <i className="bi bi-images me-1"></i>+{extraImagesCount} más
            </span>
          )}
        </div>
      )}

      <div className="card-body d-flex flex-column p-4">
        <div className="d-flex justify-content-between align-items-center mb-2 text-secondary small">
          <span className="fw-semibold text-info">
            <i className="bi bi-person-circle me-1"></i>
            @{post.user?.nickName || 'usuario'}
          </span>
          {formattedDate && (
            <span>
              <i className="bi bi-calendar3 me-1"></i>
              {formattedDate}
            </span>
          )}
        </div>

        <p className="card-text text-light mb-3 flex-grow-1 text-preline">
          {post.description.length > 180
            ? `${post.description.slice(0, 180)}...`
            : post.description}
        </p>

        {post.tags && post.tags.length > 0 && (
          <div className="d-flex flex-wrap gap-1 mb-3">
            {post.tags.map((tag) => {
              const isSelected = selectedTag?.toLowerCase() === tag.name.toLowerCase();
              return (
                <button
                  key={tag.id || tag.name}
                  type="button"
                  onClick={() => onSelectTag && onSelectTag(tag.name)}
                  className={`badge rounded-pill border text-decoration-none ${
                    onSelectTag ? 'tag-badge-clickable' : 'tag-badge-static'
                  } ${
                    isSelected
                      ? 'bg-info text-dark border-info'
                      : 'bg-secondary bg-opacity-10 text-info border-info border-opacity-25'
                  }`}
                >
                  #{tag.name}
                </button>
              );
            })}
          </div>
        )}

        <div className="d-flex justify-content-between align-items-center pt-3 border-top border-secondary border-opacity-25 mt-auto">
          <span className="text-secondary small d-flex align-items-center gap-1">
            <i className="bi bi-chat-left-text text-info"></i>
            <strong>{visibleCommentsCount}</strong>{' '}
            {visibleCommentsCount === 1 ? 'comentario' : 'comentarios'}
          </span>

          <div className="d-flex align-items-center gap-2">
            {onDelete && (
              <button
                type="button"
                onClick={() => onDelete(post.id)}
                className="btn btn-outline-danger btn-sm rounded-pill px-2"
                title="Eliminar publicación"
              >
                <i className="bi bi-trash"></i>
              </button>
            )}
            <Link
              to={`/post/${post.id}`}
              className="btn btn-outline-info btn-sm rounded-pill px-3 fw-semibold"
            >
              Ver más <i className="bi bi-arrow-right ms-1"></i>
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
};

