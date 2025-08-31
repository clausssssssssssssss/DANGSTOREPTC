import React, { useEffect } from 'react';
import '../components/styles/Footer.css';
import '../components/styles/Acerca.css';
import { Instagram } from 'lucide-react';
import llaveroImg from '../assets/llavero.png';
import cuadroImg from '../assets/cuadro.png';



const About = () => {

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
      {/* Hero con fondo blanco, olas y espacio para video */}
      <section className="hero-olas-section">
        <div className="hero-content-grid container animate-on-scroll">
          <div className="hero-text">
            <h1 className="hero-title">DANGSTORE</h1>
            <p className="hero-subtitle">Tus recuerdos en pixeles, tu estilo en llavero.</p>
          </div>
          <div className="hero-video-wrapper">
            {/* Video ahora en el hero */}
            <div className="video-placeholder" role="region" aria-label="Video presentación Dangstore">
              <video
                src={(import.meta && import.meta.env && import.meta.env.BASE_URL ? import.meta.env.BASE_URL : '/') + 'videos/Dangstoreprocesocreativo.mp4'}
                autoPlay
                muted
                loop
                playsInline
                controls
                style={{ width: '100%', height: '100%', display: 'block' }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Descripción breve de la empresa */}
      <section className="company-description animate-on-scroll">
        <div className="container">
          <div className="gradient-panel">
            <h2 className="section-title centered large">¿Quienes somos?</h2>
            <div className="company-separator" aria-hidden="true"></div>
            <p className="company-text">
              Convertimos pequeños píxeles en grandes ideas. Cada llavero es elaborado a mano con
              precisión y dedicación, dando vida a personajes, íconos y figuras que marcan tu estilo único.
            </p>
          </div>
        </div>
      </section>

      {/* ¿Qué hacemos? - Cards */}
      <section className="what-cards animate-on-scroll">
        <div className="container">
          <div className="gradient-panel">
            <h2 className="section-title centered large">¿Qué hacemos?</h2>
            <div className="company-separator" aria-hidden="true"></div>
            <div className="cards-grid">
            <div className="action-card">
              <div className="card-media">
                <img src={llaveroImg} alt="Llaveros" />
              </div>
              <div className="card-body">
                <h3>Llaveros</h3>
                <p>
                  En DangStore creamos llaveros con Hama Beads, ¡listos o personalizados! Elegí tu
                  personaje favorito o pedí uno a tu estilo.
                </p>
              </div>
            </div>
            <div className="action-card">
              <div className="card-media">
                <img src={cuadroImg} alt="Cuadros" />
              </div>
              <div className="card-body">
                <h3>Cuadros</h3>
                <p>
                  Diseñamos cuadros con Hama Beads. Podés elegir un diseño ya hecho o pedir uno único
                  hecho a tu medida.
                </p>
              </div>
            </div>
            </div>
          </div>
        </div>
      </section>

      {/* Sección antigua removida por solicitud */}

      {/* Misión, Visión y Valores */}
      <section className="mvv-section animate-on-scroll">
        <div className="container">
          <div className="gradient-panel">
            <h2 className="section-title centered large">Nosotros</h2>
            <div className="company-separator" aria-hidden="true"></div>
          </div>
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
          <div className="footer-sections">
            {/* Columna 1: DANGSTORE */}
            <div className="footer-section">
              <h3 className="footer-title">DANGSTORE</h3>
              <p className="footer-text">
                El pixel art moderno<br />
                cobra vida.<br />
                Llaveros de Hama<br />
                Beads hechos a mano<br />
                inspirados en<br />
                videojuegos, anime y<br />
                nostalgia.<br />
                Cada pieza está hecha<br />
                con precisión y cariño.
              </p>
            </div>

            {/* Columna 2: Links */}
            <div className="footer-section">
              <h3 className="footer-title">Links</h3>
              <ul className="footer-links">
                <li><a href="/catalogo">Catálogo</a></li>
                <li><a href="/encargo">Encargo</a></li>
                <li><a href="/contacto">Contacto</a></li>
                <li><a href="/busqueda">Busqueda</a></li>
                <li><a href="/carrito">Carrito de compras</a></li>
                <li><a href="/perfil">Perfil</a></li>
                <li><a href="/acerca">Acerca</a></li>
              </ul>
            </div>

            {/* Columna 3: Contacto */}
            <div className="footer-section">
              <h3 className="footer-title">Contacto</h3>
              <p className="footer-text">
                @dangshop2024@gmail.com
              </p>
            </div>

            {/* Columna 4: Siganos */}
            <div className="footer-section">
              <h3 className="footer-title">Siganos</h3>
              <div className="footer-social">
                <a
                  href="https://www.instagram.com/dangstore.sv?igsh=Nm1rdGF0cG9jMXgz"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="social-link"
                >
                  <Instagram size={20} className="instagram-icon" />
                </a>
              </div>
            </div>
          </div>

          {/* Footer bottom */}
          <div className="footer-bottom">
            <div className="footer-bottom-content">
              <p className="footer-copyright">© {new Date().getFullYear()} Todos los derechos reservados.</p>
              <p className="footer-copyright">Creado por estudiantes del Instituto Técnico Ricaldone</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
    
  );
};

export default About;