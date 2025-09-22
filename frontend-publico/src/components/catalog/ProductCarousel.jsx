import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, Star, ArrowRight } from 'lucide-react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import './ProductCarousel.css';

const ProductCarousel = ({ 
  products, 
  autoPlay = true,
  autoPlayInterval = 4000
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const intervalRef = useRef(null);
  const carouselRef = useRef(null);
  const navigate = useNavigate();

  // Configuración del carrusel
  const itemsPerView = 3; // Mostrar 3 productos a la vez
  const maxIndex = Math.max(0, products.length - itemsPerView);

  // Auto-play funcionalidad
  useEffect(() => {
    if (autoPlay && products.length > itemsPerView) {
      intervalRef.current = setInterval(() => {
        nextSlide();
      }, autoPlayInterval);

      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      };
    }
  }, [autoPlay, autoPlayInterval, products.length, currentIndex]);

  // Limpiar intervalo cuando el componente se desmonta
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const nextSlide = () => {
    if (isAnimating) return;
    
    setIsAnimating(true);
    setCurrentIndex(prevIndex => {
      const newIndex = prevIndex >= maxIndex ? 0 : prevIndex + 1;
      return newIndex;
    });
    
    setTimeout(() => setIsAnimating(false), 500);
  };

  const prevSlide = () => {
    if (isAnimating) return;
    
    setIsAnimating(true);
    setCurrentIndex(prevIndex => {
      const newIndex = prevIndex <= 0 ? maxIndex : prevIndex - 1;
      return newIndex;
    });
    
    setTimeout(() => setIsAnimating(false), 500);
  };

  const goToSlide = (index) => {
    if (isAnimating || index === currentIndex) return;
    
    setIsAnimating(true);
    setCurrentIndex(index);
    setTimeout(() => setIsAnimating(false), 500);
  };

  // Pausar auto-play cuando el usuario interactúa
  const handleMouseEnter = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  };

  const handleMouseLeave = () => {
    if (autoPlay && products.length > itemsPerView) {
      intervalRef.current = setInterval(nextSlide, autoPlayInterval);
    }
  };

  const formatPrice = (price) => {
    const numPrice = Number(price);
    return isNaN(numPrice) ? '0.00' : numPrice.toFixed(2);
  };

  const handleViewMoreClick = () => {
    navigate('/catalogo');
  };

  if (!products || products.length === 0) {
    return (
      <div className="carousel-container">
        <div className="carousel-empty">
          <p>No hay productos populares disponibles</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="carousel-container"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      ref={carouselRef}
    >
      <div className="carousel-header">
        <div className="carousel-title-section">
          <Star className="carousel-icon" size={24} />
          <h2 className="carousel-title">Productos Populares</h2>
        </div>
        <div className="carousel-indicators">
          {Array.from({ length: maxIndex + 1 }, (_, index) => (
            <button
              key={index}
              className={`indicator ${index === currentIndex ? 'active' : ''}`}
              onClick={() => goToSlide(index)}
              aria-label={`Ir a la diapositiva ${index + 1}`}
            />
          ))}
        </div>
      </div>

      <div className="carousel-wrapper">
        {/* Botón anterior */}
        {products.length > itemsPerView && (
          <button
            className={`carousel-btn carousel-btn-prev ${currentIndex === 0 ? 'disabled' : ''}`}
            onClick={prevSlide}
            disabled={isAnimating}
            aria-label="Producto anterior"
          >
            <ChevronLeft size={24} />
          </button>
        )}

        {/* Contenedor del carrusel */}
        <div className="carousel-track-container">
          <div 
            className={`carousel-track ${isAnimating ? 'animating' : ''}`}
            style={{
              transform: `translateX(-${currentIndex * (100 / itemsPerView)}%)`,
              width: `${(products.length * 100) / itemsPerView}%`
            }}
          >
            {products.map((product, index) => (
              <div
                key={product.id || product._id}
                className={`carousel-item ${
                  index >= currentIndex && index < currentIndex + itemsPerView ? 'visible' : ''
                }`}
                style={{ width: `${100 / products.length}%` }}
              >
                <div className="product-card">
                  <div className="product-image">
                    <img 
                      src={product.image || product.images?.[0] || '/src/assets/llavero.png'} 
                      alt={product.name}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                    <div className="popular-badge-overlay">
                      <Star size={16} fill="gold" />
                      <span>Popular</span>
                    </div>
                  </div>
                  <div className="product-info">
                    <p className="product-subtitle">{product.category}</p>
                    <div className="product-footer">
                      <button
                        className="view-more-btn"
                        onClick={handleViewMoreClick}
                        aria-label="Ver más productos"
                      >
                        <ArrowRight size={16} />
                        <span>Ver más</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Botón siguiente */}
        {products.length > itemsPerView && (
          <button
            className={`carousel-btn carousel-btn-next ${currentIndex >= maxIndex ? 'disabled' : ''}`}
            onClick={nextSlide}
            disabled={isAnimating}
            aria-label="Siguiente producto"
          >
            <ChevronRight size={24} />
          </button>
        )}
      </div>

      {/* Controles adicionales */}
      <div className="carousel-controls">
        <div className="carousel-info">
          <span className="carousel-counter">
            {currentIndex + 1} - {Math.min(currentIndex + itemsPerView, products.length)} de {products.length}
          </span>
        </div>
      </div>
    </div>
  );
};

ProductCarousel.propTypes = {
  products: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      _id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      name: PropTypes.string.isRequired,
      price: PropTypes.number.isRequired,
      image: PropTypes.string,
      images: PropTypes.arrayOf(PropTypes.string),
      category: PropTypes.string,
    })
  ).isRequired,
  autoPlay: PropTypes.bool,
  autoPlayInterval: PropTypes.number,
};

export default ProductCarousel;

