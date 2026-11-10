import { useState, type FormEvent } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { registerUser } from '../services/api';
import { useAuth } from '../context/AuthContext';

export const Register = () => {
  const { isAuthenticated, loginDirect } = useAuth();
  const navigate = useNavigate();

  const [nickName, setNickName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (isAuthenticated && !successMsg) {
    return <Navigate to="/" replace />;
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    const trimmedNick = nickName.trim();
    if (!trimmedNick) {
      setError('El campo nickName es obligatorio para registrarse.');
      return;
    }

    if (trimmedNick.length < 3) {
      setError('El nickName debe tener al menos 3 caracteres.');
      return;
    }

    try {
      setLoading(true);
      const createdUser = await registerUser(trimmedNick);
      setSuccessMsg(`¡Usuario @${createdUser.nickName} creado exitosamente! Redirigiendo...`);
      loginDirect(createdUser);
      setTimeout(() => {
        navigate('/');
      }, 1200);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'No se pudo crear el usuario. Intentá con otro nickName.'
      );
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
                <h2 className="fw-bold mb-1">Crear Cuenta</h2>
                <p className="text-secondary small">
                  Elegí un <code className="text-info">nickName</code> único para unirte a UnaHur Anti-Social Net
                </p>
              </div>

              {error && (
                <div className="alert alert-danger d-flex align-items-center gap-2 py-2" role="alert">
                  <i className="bi bi-exclamation-octagon-fill flex-shrink-0"></i>
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
                <div className="mb-4">
                  <label htmlFor="registerNickName" className="form-label fw-semibold">
                    NickName <span className="text-danger">*</span>
                  </label>
                  <div className="input-group">
                    <span className="input-group-text bg-body-tertiary border-secondary border-opacity-50">
                      <i className="bi bi-at text-info"></i>
                    </span>
                    <input
                      id="registerNickName"
                      type="text"
                      className="form-control border-secondary border-opacity-50"
                      placeholder="Tu apodo único..."
                      value={nickName}
                      onChange={(e) => setNickName(e.target.value)}
                      disabled={loading || Boolean(successMsg)}
                      required
                    />
                  </div>
                  <div className="form-text text-secondary small">
                    El servidor verificará que el nickName no esté registrado previamente.
                  </div>
                </div>

                <button
                  type="submit"
                  className="btn btn-info w-100 text-dark fw-bold py-2"
                  disabled={loading || Boolean(successMsg)}
                >
                  {loading ? (
                    <>
                      <span
                        className="spinner-border spinner-border-sm me-2"
                        role="status"
                        aria-hidden="true"
                      ></span>
                      Registrando usuario...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-person-check me-2"></i>
                      Registrarme
                    </>
                  )}
                </button>
              </form>

              <hr className="border-secondary border-opacity-25 my-4" />

              <p className="text-center text-secondary small mb-0">
                ¿Ya tenés un usuario?{' '}
                <Link to="/login" className="text-info fw-semibold text-decoration-none">
                  Iniciá sesión acá
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

