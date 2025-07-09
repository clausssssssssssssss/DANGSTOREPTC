// About.jsx - Página Acerca de DANGSTORE
import React, { useEffect, useRef } from 'react';
import './Acerca.css';

const About = () => {
  const videoRef = useRef(null);

  useEffect(() => {
    // Animación de entrada para elementos
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-in');
        }
      });
    }, observerOptions);

    const animatedElements = document.querySelectorAll('.animate-on-scroll');
    animatedElements.forEach(el => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  return (
    <div className="about-page">
      {/* Video Hero Section */}
      <section className="hero-video-section">
        <div className="video-container">
          <video
            ref={videoRef}
            className="hero-video"
            autoPlay
            muted
            loop
            playsInline
          >
            <source src="/videos/dangstore-intro.mp4" type="video/mp4" />
            {/* Fallback para navegadores que no soporten video */}
            <div className="video-fallback">
              <div className="fallback-content">
                <h1>DANGSTORE</h1>
                <p>Tu recorrido en plantas, tu estilo en lavero</p>
              </div>
            </div>
          </video>
          <div className="video-overlay">
            <div className="hero-content">
              <h1 className="hero-title">DANGSTORE</h1>
              <p className="hero-subtitle">Tus recuerdos en pixeles, tu estilo en llavero.</p>
              <div className="hero-decoration">
                <div className="decoration-line"></div>
                <div className="decoration-dots">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
                <div className="decoration-line"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Descripción de la Tienda */}
      <section className="store-description animate-on-scroll">
        <div className="container">
          <div className="description-grid">
            <div className="description-content">
              <h2 className="section-title">¿Qué hacemos?</h2>
              <div className="description-text">
                <p>
                  Convertimos pequeños píxeles en grandes ideas. Cada llavero es elaborado a
                   mano con  <strong>precisión y dedicación</strong>, dando vida a personajes, íconos y figuras
                   que marcan tu estilo único.
                </p>
                <p>
                 En DangStore creamos <strong>llaveros</strong> con Hama Beads, ¡listos o personalizados! Elegí 
                 tu personaje favorito o pedí uno a tu estilo.
                </p>
                <p>
                 En DangStore diseñamos <strong>cuadros</strong> con Hama Beads. Podés elegir un diseño ya hecho o pedir uno único
                  hecho a tu medida.
                </p>
              </div>
            </div>
            <div className="description-images">
              <div className="image-card main-image">
                <div className="image-placeholder">
                  <div className="placeholder-icon">🎨</div>
                  <span>Proceso Creativo</span>
                </div>
              </div>
              <div className="image-grid">
                <div className="image-card">
                  <div className="image-placeholder small">
                    <div className="placeholder-icon">🔑</div>
                    <span>Llaveros</span>
                  </div>
                </div>
                <div className="image-card">
                  <div className="image-placeholder small">
                    <div className="placeholder-icon">🖼️</div>
                    <span>Cuadros</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Misión, Visión y Valores */}
      <section className="mvv-section animate-on-scroll">
        <div className="container">
          <h2 className="section-title centered">Nosotros</h2>
          <div className="mvv-grid">
            {/* Misión */}
            <div className="mvv-card">
              <div className="mvv-icon">
                <svg viewBox="0 0 100 100" className="icon-mission">
                  <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="3"/>
                  <circle cx="50" cy="50" r="30" fill="none" stroke="currentColor" strokeWidth="2"/>
                  <circle cx="50" cy="50" r="15" fill="currentColor"/>
                  <path d="M50 5 L55 15 L50 25 L45 15 Z" fill="currentColor"/>
                  <path d="M95 50 L85 55 L75 50 L85 45 Z" fill="currentColor"/>
                  <path d="M50 95 L45 85 L50 75 L55 85 Z" fill="currentColor"/>
                  <path d="M5 50 L15 45 L25 50 L15 55 Z" fill="currentColor"/>
                </svg>
              </div>
              <h3>Misión</h3>
              <p>
                Ofrecer accesorios únicos y creativos hechos a mano, elaborados principalmente con hama beads, brindando
                 a cada cliente un producto especial, un detalle hecho con dedicación, que transmita originalidad y alegría.
              </p>
            </div>

            {/* Visión */}
            <div className="mvv-card">
              <div className="mvv-icon">
                <svg viewBox="0 0 100 100" className="icon-vision">
                  <path d="M50 20 C30 20, 15 35, 15 50 C15 65, 30 80, 50 80 C70 80, 85 65, 85 50 C85 35, 70 20, 50 20 Z" 
                        fill="none" stroke="currentColor" strokeWidth="3"/>
                  <circle cx="50" cy="50" r="15" fill="none" stroke="currentColor" strokeWidth="2"/>
                  <circle cx="50" cy="50" r="5" fill="currentColor"/>
                  <path d="M25 30 L15 25 M75 30 L85 25 M25 70 L15 75 M75 70 L85 75" 
                        stroke="currentColor" strokeWidth="2"/>
                  <path d="M50 10 L50 5 M50 90 L50 95 M10 50 L5 50 M90 50 L95 50" 
                        stroke="currentColor" strokeWidth="2"/>
                </svg>
              </div>
              <h3>Visión</h3>
              <p>
                Ser una marca reconocida por su creatividad y calidad en el diseño de accesorios artesanales, expandiéndonos a nuevos productos como pines y objetos decorativos, mientras
                  fortalecemos la conexión con nuestros clientes  y mantenemos la esencia creativa que nos distingue.
              </p>
            </div>

            {/* Valores */}
            <div className="mvv-card">
              <div className="mvv-icon">
                <svg viewBox="0 0 100 100" className="icon-values">
                  <path d="M50 15 L65 35 L85 40 L70 60 L75 80 L50 70 L25 80 L30 60 L15 40 L35 35 Z" 
                        fill="none" stroke="currentColor" strokeWidth="3"/>
                  <circle cx="50" cy="45" r="8" fill="currentColor"/>
                  <path d="M42 55 L50 65 L58 55" fill="none" stroke="currentColor" strokeWidth="2"/>
                  <path d="M35 25 L40 30 M65 25 L60 30" stroke="currentColor" strokeWidth="2"/>
                </svg>
              </div>
              <h3>Valores</h3>
              <p>
              Respeto, Responsabilidad, Creatividad, Confianza, Honestidad.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <div className="footer-grid">
            {/* Información de la empresa */}
            <div className="footer-section">
              <h3>DANGSTORE</h3>
              <p>Tu recorrido en plantas, tu estilo en lavero</p>
              <div className="social-links">
                <a href="#" className="social-link">
                  <svg viewBox="0 0 24 24" className="social-icon">
                    <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
                  </svg>
                </a>
                <a href="#" className="social-link">
                  <svg viewBox="0 0 24 24" className="social-icon">
                    <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.174-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.402.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.357-.629-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24.009 12.017 24.009c6.624 0 11.99-5.367 11.99-11.988C24.007 5.367 18.641.001.012.017 0z"/>
                  </svg>
                </a>
                <a href="#" className="social-link">
                  <svg viewBox="0 0 24 24" className="social-icon">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                </a>
              </div>
            </div>

            {/* Links */}
            <div className="footer-section">
              <h4>Links</h4>
              <ul className="footer-links">
                <li><a href="/catalogo">Catálogo</a></li>
                <li><a href="/encargo">Encargo</a></li>
                <li><a href="/acerca">Acerca</a></li>
                <li><a href="/contacto">Contacto</a></li>
              </ul>
            </div>

            {/* Contacto */}
            <div className="footer-section">
              <h4>Contacto</h4>
              <div className="contact-info">
                <p>📧 dangstore2024@gmail.com</p>
                <p>📱 +1234567890</p>
                <p>📍 San Salvador, El Salvador</p>
              </div>
            </div>

            {/* Síguenos */}
            <div className="footer-section">
              <h4>Síguenos</h4>
              <p>Mantente conectado con nosotros para las últimas novedades y productos exclusivos.</p>
              <div className="newsletter">
                <input type="email" placeholder="Tu email" className="newsletter-input" />
                <button className="newsletter-button">Suscribirse</button>
              </div>
            </div>
          </div>

          <div className="footer-bottom">
            <div className="footer-divider"></div>
            <div className="footer-bottom-content">
              <p>&copy; 2024 DANGSTORE. Todos los derechos reservados.</p>
              <div className="footer-bottom-links">
                <a href="/privacidad">Política de Privacidad</a>  
                <a href="/terminos">Términos de Servicio</a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default About;