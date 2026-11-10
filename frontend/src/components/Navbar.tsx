import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark border-bottom border-secondary border-opacity-25 sticky-top shadow-sm">
      <div className="container">
        <Link className="navbar-brand fw-bold d-flex align-items-center gap-2" to="/">
          <img
            src="/img/imagen4.jpg"
            alt="Logo UnaHur Anti-Social Net"
            className="navbar-logo-img"
          />
          <span>
            UnaHur <span className="text-info">Anti-Social</span> Net
          </span>
        </Link>

        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#mainNavbar"
          aria-controls="mainNavbar"
          aria-expanded="false"
          aria-label="Alternar navegación"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="mainNavbar">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            <li className="nav-item">
              <NavLink
                to="/"
                end
                className={({ isActive }) =>
                  `nav-link ${isActive ? 'active text-info fw-semibold' : ''}`
                }
              >
                <i className="bi bi-house-door me-1"></i>
                Inicio
              </NavLink>
            </li>

            {isAuthenticated && (
              <>
                <li className="nav-item">
                  <NavLink
                    to="/create-post"
                    className={({ isActive }) =>
                      `nav-link ${isActive ? 'active text-info fw-semibold' : ''}`
                    }
                  >
                    <i className="bi bi-plus-circle me-1"></i>
                    Nueva Publicación
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink
                    to="/profile"
                    className={({ isActive }) =>
                      `nav-link ${isActive ? 'active text-info fw-semibold' : ''}`
                    }
                  >
                    <i className="bi bi-person-circle me-1"></i>
                    Mi Perfil
                  </NavLink>
                </li>
              </>
            )}
          </ul>

          <div className="d-flex align-items-center gap-2">
            {isAuthenticated && user ? (
              <>
                <Link
                  to="/profile"
                  className="badge bg-info bg-opacity-10 text-info border border-info border-opacity-25 text-decoration-none px-3 py-2"
                >
                  <i className="bi bi-at"></i>
                  {user.nickName}
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="btn btn-outline-danger btn-sm"
                >
                  <i className="bi bi-box-arrow-right me-1"></i>
                  Salir
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="btn btn-outline-info btn-sm">
                  <i className="bi bi-box-arrow-in-right me-1"></i>
                  Iniciar Sesión
                </Link>
                <Link to="/register" className="btn btn-info btn-sm text-dark fw-semibold">
                  <i className="bi bi-person-plus me-1"></i>
                  Registrarse
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

