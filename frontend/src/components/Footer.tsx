export const Footer = () => {
  return (
    <footer className="bg-dark border-top border-secondary border-opacity-25 py-4 mt-auto">
      <div className="container d-flex flex-column flex-md-row justify-content-between align-items-center gap-2 text-secondary small">
        <div className="d-flex align-items-center gap-2">
          <img
            src="/img/imagen4.jpg"
            alt="Logo UnaHur Anti-Social Net"
            className="footer-logo-img"
          />
          <span>
            <strong className="text-light">UnaHur Anti-Social Net</strong> — Conectando desde la distancia.
          </span>
        </div>
        <div>
          Construcción de Interfaces de Usuario · UNAHUR
        </div>
      </div>
    </footer>
  );
};

