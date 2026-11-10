import { useEffect, useState, type ChangeEvent, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import type { Tag } from '../types';
import { createPost, getTags } from '../services/api';
import { useAuth } from '../context/AuthContext';

export const CreatePost = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Estados controlados del formulario
  const [description, setDescription] = useState('');
  const [imageUrls, setImageUrls] = useState<string[]>(['']);
  const [availableTags, setAvailableTags] = useState<Tag[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [customTag, setCustomTag] = useState('');

  const [loadingTags, setLoadingTags] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    const fetchAvailableTags = async () => {
      try {
        setLoadingTags(true);
        const tags = await getTags();
        setAvailableTags(tags);
      } catch {
        setAvailableTags([]);
      } finally {
        setLoadingTags(false);
      }
    };

    void fetchAvailableTags();
  }, []);

  // Manejo de múltiples campos de URLs de imágenes
  const handleImageChange = (index: number, value: string) => {
    setImageUrls((prev) => prev.map((url, idx) => (idx === index ? value : url)));
  };

  const handleAddImageField = () => {
    setImageUrls((prev) => [...prev, '']);
  };

  const handleRemoveImageField = (index: number) => {
    if (imageUrls.length === 1) {
      setImageUrls(['']);
      return;
    }
    setImageUrls((prev) => prev.filter((_, idx) => idx !== index));
  };

  // Permite también cargar una imagen desde la computadora convirtiéndola a Data URL
  const handleFileSelect = (index: number, e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        handleImageChange(index, reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  // Selección de etiquetas obtenidas desde la API
  const handleToggleTag = (tagName: string) => {
    const normalized = tagName.trim().toLowerCase();
    setSelectedTags((prev) =>
      prev.includes(normalized)
        ? prev.filter((t) => t !== normalized)
        : [...prev, normalized]
    );
  };

  const handleAddCustomTag = () => {
    const clean = customTag.trim().toLowerCase().replace(/^#/, '');
    if (!clean) return;

    if (!availableTags.some((t) => t.name.toLowerCase() === clean)) {
      setAvailableTags((prev) => [...prev, { id: clean, name: clean }]);
    }
    if (!selectedTags.includes(clean)) {
      setSelectedTags((prev) => [...prev, clean]);
    }
    setCustomTag('');
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (!description.trim()) {
      setError('La descripción de la publicación es obligatoria.');
      return;
    }

    if (!user) {
      setError('Debés iniciar sesión para crear una publicación.');
      return;
    }

    // Filtramos las URLs de imágenes no vacías
    const cleanUrls: string[] = [];
    for (const rawUrl of imageUrls) {
      const trimmed = rawUrl.trim();
      if (!trimmed) continue;

      if (trimmed.startsWith('/')) {
        cleanUrls.push(`${window.location.origin}${trimmed}`);
      } else if (
        trimmed.startsWith('http://') ||
        trimmed.startsWith('https://') ||
        trimmed.startsWith('data:image/')
      ) {
        cleanUrls.push(trimmed);
      } else {
        setError(
          `La URL de imagen "${trimmed}" no es válida. Debe comenzar con http:// o https://`
        );
        return;
      }
    }

    try {
      setSubmitting(true);
      await createPost({
        description: description.trim(),
        userId: user.id,
        tags: selectedTags,
        images: cleanUrls,
      });

      setSuccessMsg('¡Publicación creada exitosamente! Redirigiendo a tu perfil...');
      setTimeout(() => {
        navigate('/profile');
      }, 1200);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Ocurrió un error al crear la publicación.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container py-4">
      <div className="row justify-content-center">
        <div className="col-12 col-lg-8">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <Link to="/profile" className="btn btn-outline-secondary btn-sm rounded-pill px-3">
              <i className="bi bi-arrow-left me-1"></i> Volver a mi Perfil
            </Link>
          </div>

          <div className="card bg-dark border-secondary border-opacity-25 rounded-4 shadow-lg">
            <div className="card-body p-4 p-md-5">
              <div className="mb-4">
                <h2 className="fw-bold mb-1">
                  <i className="bi bi-plus-square text-info me-2"></i>
                  Crear Nueva Publicación
                </h2>
                <p className="text-secondary small mb-0">
                  Publicando como <strong className="text-info">@{user?.nickName}</strong>
                </p>
              </div>

              {error && (
                <div className="alert alert-danger d-flex align-items-center gap-2 py-2" role="alert">
                  <i className="bi bi-exclamation-triangle-fill flex-shrink-0"></i>
                  <div className="small">{error}</div>
                </div>
              )}

              {successMsg && (
                <div className="alert alert-success d-flex align-items-center gap-2 py-2" role="alert">
                  <i className="bi bi-check-circle-fill flex-shrink-0"></i>
                  <div className="small">{successMsg}</div>
                </div>
              )}

              <form onSubmit={handleSubmit} noValidate>
                {/* 1. Descripción (obligatoria) */}
                <div className="mb-4">
                  <label htmlFor="postDescription" className="form-label fw-semibold">
                    Descripción de la publicación <span className="text-danger">*</span>
                  </label>
                  <textarea
                    id="postDescription"
                    rows={4}
                    className="form-control border-secondary border-opacity-50"
                    placeholder="¿Qué estás pensando o qué querés compartir hoy?"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    disabled={submitting || Boolean(successMsg)}
                    required
                  />
                </div>

                {/* 2. URLs de imágenes (opcional): uno o más campos */}
                <div className="mb-4">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <label className="form-label fw-semibold mb-0">
                      <i className="bi bi-images text-info me-1"></i>
                      URLs de imágenes <span className="text-secondary fw-normal small">(opcional)</span>
                    </label>
                    <button
                      type="button"
                      onClick={handleAddImageField}
                      className="btn btn-outline-info btn-sm"
                      disabled={submitting || Boolean(successMsg)}
                    >
                      <i className="bi bi-plus-lg me-1"></i> Agregar otra URL
                    </button>
                  </div>

                  <div className="d-flex flex-column gap-3">
                    {imageUrls.map((url, idx) => (
                      <div key={idx}>
                        <div className="input-group">
                          <span className="input-group-text bg-body-tertiary border-secondary border-opacity-50">
                            <i className="bi bi-link-45deg text-info"></i>
                          </span>
                          <input
                            type="url"
                            className="form-control border-secondary border-opacity-50"
                            placeholder="Pegá la dirección directa de la imagen (https://...)"
                            value={url.startsWith('data:image/') ? '' : url}
                            onChange={(e) => handleImageChange(idx, e.target.value)}
                            disabled={submitting || Boolean(successMsg)}
                          />
                          <label
                            className="btn btn-outline-secondary mb-0"
                            title="Elegir archivo de imagen desde tu PC"
                          >
                            <i className="bi bi-upload me-1"></i> Archivo
                            <input
                              type="file"
                              accept="image/*"
                              className="d-none"
                              onChange={(e) => handleFileSelect(idx, e)}
                              disabled={submitting || Boolean(successMsg)}
                            />
                          </label>
                          <button
                            type="button"
                            onClick={() => handleRemoveImageField(idx)}
                            className="btn btn-outline-danger"
                            title="Quitar imagen"
                            disabled={submitting || Boolean(successMsg)}
                          >
                            <i className="bi bi-trash"></i>
                          </button>
                        </div>

                        {/* Vista previa en vivo de la imagen */}
                        {url.trim() && (
                          <div className="mt-2 d-flex align-items-center gap-2">
                            <img
                              src={url.trim()}
                              alt={`Vista previa ${idx + 1}`}
                              className="rounded-3 border border-secondary create-post-preview-img"
                            />
                            <span className="text-secondary small">
                              Vista previa de la imagen {idx + 1}
                            </span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                  <div className="form-text text-secondary small">
                    Tip: Si copiás una foto de Google, hacé clic derecho sobre la foto y elegí{' '}
                    <strong>"Copiar dirección de imagen"</strong>, o bien tocá el botón{' '}
                    <strong>Archivo</strong> para elegir una de tu PC.
                  </div>
                </div>

                {/* 3. Selección de etiquetas obtenidas desde la API */}
                <div className="mb-4">
                  <label className="form-label fw-semibold">
                    <i className="bi bi-tags text-info me-1"></i>
                    Seleccionar Etiquetas (Tags)
                  </label>

                  {loadingTags ? (
                    <div className="text-secondary small py-2">
                      <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                      Cargando etiquetas desde la API...
                    </div>
                  ) : availableTags.length === 0 ? (
                    <p className="text-secondary small mb-2">
                      Aún no hay etiquetas cargadas en el servidor. Podés agregar una abajo:
                    </p>
                  ) : (
                    <div className="d-flex flex-wrap gap-2 mb-3">
                      {availableTags.map((tag) => {
                        const isChecked = selectedTags.includes(tag.name.toLowerCase());
                        return (
                          <button
                            key={tag.id || tag.name}
                            type="button"
                            onClick={() => handleToggleTag(tag.name)}
                            disabled={submitting || Boolean(successMsg)}
                            className={`btn btn-sm rounded-pill ${
                              isChecked ? 'btn-info text-dark fw-bold' : 'btn-outline-secondary'
                            }`}
                          >
                            <i
                              className={`bi ${
                                isChecked ? 'bi-check-circle-fill' : 'bi-hash'
                              } me-1`}
                            ></i>
                            {tag.name}
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {/* Campo auxiliar para sumar etiqueta nueva */}
                  <div className="input-group input-group-sm custom-tag-group">
                    <input
                      type="text"
                      className="form-control border-secondary border-opacity-50"
                      placeholder="Nueva etiqueta (ej: react, unahur)..."
                      value={customTag}
                      onChange={(e) => setCustomTag(e.target.value)}
                      disabled={submitting || Boolean(successMsg)}
                    />
                    <button
                      type="button"
                      onClick={handleAddCustomTag}
                      className="btn btn-outline-info"
                      disabled={submitting || Boolean(successMsg)}
                    >
                      <i className="bi bi-plus-circle me-1"></i> Sumar etiqueta
                    </button>
                  </div>
                </div>

                <hr className="border-secondary border-opacity-25 my-4" />

                <div className="d-flex justify-content-end gap-2">
                  <Link
                    to="/profile"
                    className="btn btn-outline-secondary px-4"
                  >
                    Cancelar
                  </Link>
                  <button
                    type="submit"
                    className="btn btn-info text-dark fw-bold px-4"
                    disabled={submitting || Boolean(successMsg)}
                  >
                    {submitting ? (
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
                        <i className="bi bi-send-check-fill me-2"></i>
                        Publicar Posteo
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
