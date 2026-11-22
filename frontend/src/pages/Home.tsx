import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import type { Post, Tag } from '../types';
import { getPosts, getTags } from '../services/api';
import { PostCard } from '../components/PostCard';
import { useAuth } from '../context/AuthContext';

const SLOGANS = [
  '“Menos algoritmos falsos, más pensamientos reales.”',
  '“Los comentarios duran lo que tienen que durar: después, el olvido digital.”',
  '“Sin likes vacíos: solo publicaciones, etiquetas y debate directo.”',
];

const CAROUSEL_SLIDES = [
  {
    image: '/img/imagen1.jpg',
    alt: 'UnaHur Anti-Social Net - Imagen 1',
  },
  {
    image: '/img/imagen2.jpg',
    alt: 'UnaHur Anti-Social Net - Imagen 2',
  },
  {
    image: '/img/imagen3.jpg',
    alt: 'UnaHur Anti-Social Net - Imagen 3',
  },
];

export const Home = () => {
  const { isAuthenticated, user } = useAuth();

  const [posts, setPosts] = useState<Post[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [randomPost, setRandomPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Estado controlado del carrusel de 3 imágenes
  const [activeSlide, setActiveSlide] = useState(0);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [postsData, tagsData] = await Promise.all([
        getPosts(),
        getTags().catch(() => [] as Tag[]),
      ]);
      setPosts(postsData);

      if (tagsData.length > 0) {
        setTags(tagsData);
      } else {
        const extracted = new Map<string, Tag>();
        postsData.forEach((p) =>
          p.tags?.forEach((t) => {
            extracted.set(t.name.toLowerCase(), t);
          })
        );
        setTags(Array.from(extracted.values()));
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'No se pudo conectar con la API del BackEnd.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, []);

  // Rotación automática del carrusel cada 4 segundos
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % CAROUSEL_SLIDES.length);
    }, 4000);

    return () => clearInterval(timer);
  }, []);

  const handlePrevSlide = () => {
    setActiveSlide((prev) =>
      prev === 0 ? CAROUSEL_SLIDES.length - 1 : prev - 1
    );
  };

  const handleNextSlide = () => {
    setActiveSlide((prev) => (prev + 1) % CAROUSEL_SLIDES.length);
  };

  const handleToggleTag = (tagName: string) => {
    setSelectedTag((prev) =>
      prev?.toLowerCase() === tagName.toLowerCase() ? null : tagName
    );
  };

  const handlePickRandomPost = () => {
    if (posts.length === 0) return;
    const randomIndex = Math.floor(Math.random() * posts.length);
    setRandomPost(posts[randomIndex]);
  };

  const filteredPosts = selectedTag
    ? posts.filter((post) =>
        post.tags?.some((t) => t.name.toLowerCase() === selectedTag.toLowerCase())
      )
    : posts;

  return (
    <div className="container py-4">
      {/* 1. Carrusel de 3 imágenes de bienvenida */}
      <section className="mb-4">
        <div className="carousel slide hero-banner shadow-lg border border-secondary border-opacity-25">
          {/* Indicadores inferiores (3 puntos) */}
          <div className="carousel-indicators">
            {CAROUSEL_SLIDES.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setActiveSlide(idx)}
                className={idx === activeSlide ? 'active' : ''}
                aria-current={idx === activeSlide ? 'true' : undefined}
                aria-label={`Imagen ${idx + 1}`}
              ></button>
            ))}
          </div>

          {/* Las 3 imágenes del carrusel */}
          <div className="carousel-inner">
            {CAROUSEL_SLIDES.map((slide, idx) => (
              <div
                key={idx}
                className={`carousel-item ${idx === activeSlide ? 'active' : ''}`}
              >
                <img
                  src={slide.image}
                  alt={slide.alt}
                  className="d-block w-100 carousel-hero-img"
                />
              </div>
            ))}
          </div>

          {/* Botones Anterior / Siguiente */}
          <button
            className="carousel-control-prev carousel-arrow-btn ms-3"
            type="button"
            onClick={handlePrevSlide}
            aria-label="Imagen anterior"
          >
            <span className="carousel-control-prev-icon" aria-hidden="true"></span>
          </button>
          <button
            className="carousel-control-next carousel-arrow-btn me-3"
            type="button"
            onClick={handleNextSlide}
            aria-label="Imagen siguiente"
          >
            <span className="carousel-control-next-icon" aria-hidden="true"></span>
          </button>
        </div>

        {/* Barra de bienvenida y acciones rápidas debajo del carrusel */}
        <div className="card bg-dark border-secondary border-opacity-25 rounded-4 p-3 p-md-4 mt-3 shadow-sm">
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
            <div>
              <h5 className="fw-bold mb-1 text-white">
                <i className="bi bi-broadcast text-info me-2"></i>
                Bienvenido a <span className="text-info">UnaHur Anti-Social Net</span>
              </h5>
              <p className="text-secondary small mb-0">
                Navegá las publicaciones recientes, filtrá por etiquetas o compartí tu propio posteo.
              </p>
            </div>

            {(isAuthenticated || posts.length > 0) && (
              <div className="d-flex flex-wrap gap-2">
                {isAuthenticated && (
                  <>
                    <Link
                      to="/create-post"
                      className="btn btn-info text-dark fw-bold btn-sm px-3"
                    >
                      <i className="bi bi-plus-lg me-1"></i>
                      Crear Publicación
                    </Link>
                    <Link to="/profile" className="btn btn-outline-light btn-sm px-3">
                      <i className="bi bi-person-circle me-1"></i>
                      @{user?.nickName}
                    </Link>
                  </>
                )}

                {posts.length > 0 && (
                  <button
                    type="button"
                    onClick={handlePickRandomPost}
                    className="btn btn-outline-info btn-sm px-3"
                  >
                    <i className="bi bi-shuffle me-1"></i> Post Aleatorio
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Bonus: Publicación destacada / aleatoria */}
      {randomPost && (
        <section className="alert alert-info bg-dark border-info text-light rounded-4 p-4 mb-4 shadow-sm">
          <div className="d-flex justify-content-between align-items-start mb-2">
            <span className="badge bg-info text-dark fw-bold">
              <i className="bi bi-stars me-1"></i> PUBLICACIÓN DESTACADA AL AZAR
            </span>
            <button
              type="button"
              className="btn-close btn-close-white"
              aria-label="Cerrar"
              onClick={() => setRandomPost(null)}
            ></button>
          </div>
          <p className="mb-2">{randomPost.description}</p>
          <div className="d-flex justify-content-between align-items-center small text-secondary">
            <span>
              Por{' '}
              {randomPost.user?.id || randomPost.userId ? (
                <Link
                  to={`/profile/${randomPost.user?.id || randomPost.userId}`}
                  className="text-info fw-semibold text-decoration-none author-profile-link"
                >
                  @{randomPost.user?.nickName || 'usuario'}
                </Link>
              ) : (
                <>@{randomPost.user?.nickName || 'usuario'}</>
              )}
            </span>
            <Link to={`/post/${randomPost.id}`} className="btn btn-sm btn-info text-dark fw-semibold">
              Ir al post <i className="bi bi-arrow-right ms-1"></i>
            </Link>
          </div>
        </section>
      )}

      {/* 2. Feed de publicaciones recientes + Filtro por etiquetas (Bonus) */}
      <section className="mb-5">
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
          <div>
            <h2 className="fw-bold mb-1 d-flex align-items-center gap-2">
              <i className="bi bi-collection-play text-info"></i>
              Feed de Publicaciones Recientes
            </h2>
            <p className="text-secondary small mb-0">
              Explorá los últimos posteos de la comunidad y sumá tus comentarios.
            </p>
          </div>

          <button
            type="button"
            onClick={loadData}
            className="btn btn-outline-secondary btn-sm align-self-start align-self-md-center"
            disabled={loading}
          >
            <i className="bi bi-arrow-clockwise me-1"></i> Actualizar feed
          </button>
        </div>

        {/* Barra de filtro por etiquetas (Bonus) */}
        {tags.length > 0 && (
          <div className="card bg-dark border-secondary border-opacity-25 rounded-4 p-3 mb-4">
            <div className="d-flex flex-wrap align-items-center gap-2">
              <span className="text-secondary small fw-semibold me-1">
                <i className="bi bi-tags text-info me-1"></i> Filtrar por etiqueta:
              </span>
              <button
                type="button"
                onClick={() => setSelectedTag(null)}
                className={`btn btn-sm rounded-pill ${
                  selectedTag === null ? 'btn-info text-dark fw-bold' : 'btn-outline-secondary'
                }`}
              >
                Todas ({posts.length})
              </button>
              {tags.map((tag) => {
                const isSelected = selectedTag?.toLowerCase() === tag.name.toLowerCase();
                return (
                  <button
                    key={tag.id || tag.name}
                    type="button"
                    onClick={() => handleToggleTag(tag.name)}
                    className={`btn btn-sm rounded-pill ${
                      isSelected ? 'btn-info text-dark fw-bold' : 'btn-outline-info'
                    }`}
                  >
                    #{tag.name}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Estado de carga / error / listado */}
        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-info mb-3" role="status">
              <span className="visually-hidden">Cargando publicaciones...</span>
            </div>
            <p className="text-secondary">Cargando publicaciones recientes...</p>
          </div>
        ) : error ? (
          <div className="alert alert-danger rounded-4 p-4 d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3">
            <div>
              <h5 className="alert-heading fw-bold mb-1">
                <i className="bi bi-wifi-off me-2"></i>No se pudo cargar el feed
              </h5>
              <p className="mb-0 small">{error}</p>
            </div>
            <button type="button" onClick={loadData} className="btn btn-outline-danger btn-sm">
              Reintentar
            </button>
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="card bg-dark border-secondary border-opacity-25 rounded-4 p-5 text-center">
            <i className="bi bi-journal-x text-secondary display-4 mb-3"></i>
            <h4 className="fw-bold">No hay publicaciones para mostrar</h4>
            <p className="text-secondary mb-3">
              {selectedTag
                ? `No encontramos publicaciones con la etiqueta #${selectedTag}.`
                : 'Todavía nadie publicó nada en la red. ¡Sé la primera persona en postear!'}
            </p>
            {selectedTag ? (
              <div>
                <button
                  type="button"
                  onClick={() => setSelectedTag(null)}
                  className="btn btn-outline-info btn-sm"
                >
                  Quitar filtro
                </button>
              </div>
            ) : (
              <div>
                <Link to="/create-post" className="btn btn-info text-dark fw-bold">
                  Crear primera publicación
                </Link>
              </div>
            )}
          </div>
        ) : (
          <div className="row g-4">
            {filteredPosts.map((post) => (
              <div key={post.id} className="col-12 col-md-6 col-lg-4">
                <PostCard
                  post={post}
                  onSelectTag={handleToggleTag}
                  selectedTag={selectedTag}
                />
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 3. Sección "Sobre nosotros" y Datos curiosos / Frases destacadas */}
      <section className="py-4 border-top border-secondary border-opacity-25">
        <div className="row g-4 align-items-center">
          <div className="col-12 col-lg-6">
            <span className="text-info fw-bold small text-uppercase">Sobre Nosotros</span>
            <h3 className="fw-bold mt-1 mb-3">¿Por qué "Anti-Social Net"?</h3>
            <p className="text-secondary mb-3">
              Nacida en los laboratorios de la <strong>Universidad Nacional de Hurlingham (UNAHUR)</strong>,
              nuestra plataforma propone volver a la esencia de internet: compartir publicaciones
              con texto, imágenes y etiquetas temáticas sin la presión de los algoritmos comerciales.
            </p>
            <div className="row g-3">
              <div className="col-12 col-sm-6">
                <div className="p-3 rounded-3 bg-dark border border-secondary border-opacity-25 h-100">
                  <i className="bi bi-clock-history text-info fs-4 d-block mb-2"></i>
                  <h6 className="fw-bold mb-1">Comentarios Efímeros</h6>
                  <p className="text-secondary small mb-0">
                    Solo se muestran como visibles los comentarios recientes configurados por la API.
                  </p>
                </div>
              </div>
              <div className="col-12 col-sm-6">
                <div className="p-3 rounded-3 bg-dark border border-secondary border-opacity-25 h-100">
                  <i className="bi bi-hash text-info fs-4 d-block mb-2"></i>
                  <h6 className="fw-bold mb-1">Organización por Tags</h6>
                  <p className="text-secondary small mb-0">
                    Clasificá cada posteo con etiquetas para encontrar debates al instante.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="col-12 col-lg-6">
            <div className="card bg-dark border-secondary border-opacity-25 rounded-4 overflow-hidden shadow">
              <img
                src="/img/imagen7.jpg"
                alt="Logo Red Anti-Social"
                className="w-100 object-fit-cover about-banner-img"
              />
              <div className="card-body p-4">
                <h6 className="text-info fw-bold text-uppercase small mb-3">
                  <i className="bi bi-chat-quote me-1"></i> Frases destacadas de la comunidad
                </h6>
                <ul className="list-unstyled mb-0 d-flex flex-column gap-2">
                  {SLOGANS.map((slogan, idx) => (
                    <li key={idx} className="text-light fst-italic small border-start border-info border-2 ps-3">
                      {slogan}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
