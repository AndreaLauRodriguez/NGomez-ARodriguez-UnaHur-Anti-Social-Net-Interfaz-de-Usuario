import { useState, type FormEvent } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const Login = () => {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [nickName, setNickName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (!nickName.trim() || !password.trim()) {
      setError('Por favor, completá tanto el nickName como la contraseña.');
      return;
    }

    try {
      setLoading(true);
      await login(nickName, password);
      navigate('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al iniciar sesión.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-5 my-auto">
      <div className="row justify-content-center">
        <div className="col-12 col-md-7 col-lg-5">
          <div className="card bg-dark border-secondary border-opacity-25 shadow-lg rounded-4">
            <div className="card-body p-4 p-sm-5">
              <div className="text-center mb-4">
                <div className="d-inline-flex align-items-center justify-content-center mb-3">
                  <img
                    src="/img/imagen4.jpg"
                    alt="Logo UnaHur Anti-Social Net"
                    className="auth-logo-img"
                  />
                </div>
                <h2 className="fw-bold mb-1">Iniciar Sesión</h2>
                <p className="text-secondary small">
                  Ingresá con tu <code className="text-info">nickName</code> y la clave{' '}
                  <code className="text-info">123456</code>
                </p>
              </div>

              {error && (
                <div className="alert alert-danger d-flex align-items-center gap-2 py-2" role="alert">
                  <i className="bi bi-exclamation-triangle-fill flex-shrink-0"></i>
                  <div className="small">{error}</div>
                </div>
              )}

              <form onSubmit={handleSubmit} noValidate>
                <div className="mb-3">
                  <label htmlFor="nickName" className="form-label fw-semibold">
                    NickName <span className="text-danger">*</span>
                  </label>
                  <div className="input-group">
                    <span className="input-group-text bg-body-tertiary border-secondary border-opacity-50">
                      <i className="bi bi-at text-info"></i>
                    </span>
                    <input
                      id="nickName"
                      type="text"
                      className="form-control border-secondary border-opacity-50"
                      placeholder="Ej: anti_social_99"
                      value={nickName}
                      onChange={(e) => setNickName(e.target.value)}
                      disabled={loading}
                      required
                    />
                  </div>
                </div>

                <div className="mb-4">
                  <label htmlFor="password" className="form-label fw-semibold">
                    Contraseña <span className="text-danger">*</span>
                  </label>
                  <div className="input-group">
                    <span className="input-group-text bg-body-tertiary border-secondary border-opacity-50">
                      <i className="bi bi-lock text-info"></i>
                    </span>
                    <input
                      id="password"
                      type="password"
                      className="form-control border-secondary border-opacity-50"
                      placeholder="123456"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={loading}
                      required
                    />
                  </div>
                  <div className="form-text text-secondary small">
                    Contraseña simulada fija: <strong>123456</strong>
                  </div>
                </div>

                <button
                  type="submit"
                  className="btn btn-info w-100 text-dark fw-bold py-2"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span
                        className="spinner-border spinner-border-sm me-2"
                        role="status"
                        aria-hidden="true"
                      ></span>
                      Verificando usuario...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-box-arrow-in-right me-2"></i>
                      Ingresar
                    </>
                  )}
                </button>
              </form>

              <hr className="border-secondary border-opacity-25 my-4" />

              <p className="text-center text-secondary small mb-0">
                ¿Todavía no tenés cuenta?{' '}
                <Link to="/register" className="text-info fw-semibold text-decoration-none">
                  Registrate acá
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

