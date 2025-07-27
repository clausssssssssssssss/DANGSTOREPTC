import React, { useEffect, useRef } from 'react';
import '../components/styles/Footer.css';
import '../components/styles/Acerca.css';
import { Instagram } from 'lucide-react';



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
                  fortalecemos la conexión con nuestros clientes  y mantenemos la esencia creativa que nos distingue.
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


      <footer className="footer">
      <div className="footer-container">
        <h3 className="footer-title">DANGSTORE</h3>
        <p className="footer-text">© {new Date().getFullYear()} Todos los derechos reservados.</p>
        <p className="footer-text">Creado por estudiantes del Instituto Técnico Ricaldone</p>

        <a
          href="https://www.instagram.com/dangstore.sv?igsh=Nm1rdGF0cG9jMXgz" // cambia si tu cuenta es diferente
          target="_blank"
          rel="noopener noreferrer"
          className="footer-link"
        >
          <Instagram size={20} className="instagram-icon" />
          <span>Síguenos en Instagram</span>
        </a>
      </div>
    </footer>
    </div>
    
  );
};

export default About;