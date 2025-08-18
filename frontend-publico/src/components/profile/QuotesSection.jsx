import React, { useEffect, useState } from 'react';
import { Gift } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || '';

const QuotesSection = ({ setHasQuotesFlag, showSuccess, showError, showWarning }) => {
  const [quotes, setQuotes] = useState([]);
  const [loadingQuotes, setLoadingQuotes] = useState(false);
  const [errorQuotes, setErrorQuotes] = useState('');
  const [quotesFilter, setQuotesFilter] = useState('all'); // 'all', 'pending', 'completed'

  // --- Carga inicial de cotizaciones ---
  useEffect(() => {
    fetchQuotes();
  }, [quotesFilter]);

  const fetchQuotes = async () => {
    setLoadingQuotes(true);
    setErrorQuotes('');
    try {
      const res = await fetch(`${API_URL}/api/custom-orders/me`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      if (!res.ok) throw new Error(`Status ${res.status}`);
      const data = await res.json();

      // Filtrar según el estado seleccionado
      let filteredQuotes = [];
      if (quotesFilter === 'pending') {
        filteredQuotes = data.filter(o => o.status === 'quoted' || o.status === 'pending');
      } else if (quotesFilter === 'completed') {
        filteredQuotes = data.filter(o => o.status === 'accepted' || o.status === 'rejected');
      } else {
        // 'all' - traemos todas las cotizaciones relevantes
        filteredQuotes = data.filter(
          (o) => o.status === 'quoted' || o.status === 'pending' || o.status === 'accepted' || o.status === 'rejected'
        );
      }

      setQuotes(filteredQuotes);
      // Puntito de notificación si hay alguna 'quoted'
      setHasQuotesFlag(filteredQuotes.some((o) => o.status === 'quoted'));
    } catch (err) {
      setErrorQuotes(`Error: ${err.message || err}`);
    } finally {
      setLoadingQuotes(false);
    }
  };

  const handleDecision = async (orderId, decision) => {
    try {
      const res = await fetch(`${API_URL}/api/custom-orders/${orderId}/respond`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ decision }),
      });

      if (!res.ok) throw new Error(`Status ${res.status}`);
      const updatedOrder = await res.json();

      setQuotes((q) => {
        if (decision === 'accept') {
          // Mantener la cotización con estado 'accepted'
          const updatedQuotes = q.map((item) =>
            item._id === orderId ? { ...item, status: 'accepted' } : item
          );
          // Actualizamos puntito según cotizaciones restantes
          setHasQuotesFlag(updatedQuotes.some((o) => o.status === 'quoted'));
          return updatedQuotes;
        } else {
          // Rechazado: actualizar estado a 'rejected'
          const updatedQuotes = q.map((item) =>
            item._id === orderId ? { ...item, status: 'rejected' } : item
          );
          setHasQuotesFlag(updatedQuotes.some((o) => o.status === 'quoted'));
          return updatedQuotes;
        }
      });

      if (decision === 'accept') {
        showSuccess('¡Has aceptado la cotización! El producto se ha agregado a tu carrito. Redirigiendo...');
        // Redirigir al carrito después de 2 segundos
        setTimeout(() => {
          window.location.href = '/carrito';
        }, 2000);
      } else {
        showSuccess('Cotización rechazada correctamente');
      }
    } catch (err) {
      console.error(err);
      showError('Error al procesar la decisión');
    }
  };

  const handleFilterChange = (filter) => {
    setQuotesFilter(filter);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'quoted':
        return <span className="status-badge quoted">💬 Por responder</span>;
      case 'pending':
        return <span className="status-badge pending">⏳ Esperando cotización</span>;
      case 'accepted':
        return <span className="status-badge accepted">✅ Aceptada</span>;
      case 'rejected':
        return <span className="status-badge rejected">❌ Rechazada</span>;
      default:
        return <span className="status-badge unknown">❓ Estado desconocido</span>;
    }
  };

  if (loadingQuotes) {
    return (
      <div className="content-card">
        <div className="loading-state">
          <p>Cargando cotizaciones...</p>
        </div>
      </div>
    );
  }

  if (errorQuotes) {
    return (
      <div className="content-card">
        <div className="error-state">
          <p className="error-message">{errorQuotes}</p>
          <button onClick={fetchQuotes} className="retry-btn">Reintentar</button>
        </div>
      </div>
    );
  }

  return (
    <div className="content-card">
      <div className="card-header">
        <div className="card-title">
          <Gift className="section-icon" />
          <h3>Mis cotizaciones</h3>
        </div>
        <div className="header-actions">
          <div className="quotes-filter">
            <button 
              className={`filter-btn ${quotesFilter === 'all' ? 'active' : ''}`}
              onClick={() => handleFilterChange('all')}
            >
              Todas
            </button>
            <button 
              className={`filter-btn ${quotesFilter === 'pending' ? 'active' : ''}`}
              onClick={() => handleFilterChange('pending')}
            >
              Pendientes
            </button>
            <button 
              className={`filter-btn ${quotesFilter === 'completed' ? 'active' : ''}`}
              onClick={() => handleFilterChange('completed')}
            >
              Completadas
            </button>
          </div>
        </div>
      </div>

      {quotes.length === 0 ? (
        <div className="empty-state">
          <Gift size={48} className="empty-icon" />
          <p>
            {quotesFilter === 'pending' 
              ? 'No tienes cotizaciones pendientes.'
              : quotesFilter === 'completed'
              ? 'No tienes cotizaciones completadas.'
              : 'No tienes cotizaciones.'
            }
          </p>
        </div>
      ) : (
        <div className="quotes-list">
          {quotes.map((quote) => (
            <div key={quote._id} className="quote-card">
              <div className="quote-image">
                {quote.imageUrl ? (
                  <img
                    src={`${API_URL}${quote.imageUrl}`}
                    alt={quote.modelType}
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                ) : null}
                <div
                  className="quote-placeholder"
                  style={{ display: quote.imageUrl ? 'none' : 'flex' }}
                >
                  <Gift size={24} />
                </div>
              </div>

              <div className="quote-details">
                <div className="quote-header">
                  <h4 className="quote-title">{quote.modelType}</h4>
                  {getStatusBadge(quote.status)}
                </div>
                
                <p className="quote-description">{quote.description}</p>
                
                <div className="quote-price-row">
                  <span className="quote-price">
                    ${quote.price ? quote.price.toFixed(2) : '0.00'}
                  </span>
                  
                  <div className="quote-actions">
                    {quote.status === 'quoted' && (
                      <>
                        <button
                          onClick={() => handleDecision(quote._id, 'accept')}
                          className="btn-quote accept"
                        >
                          ACEPTAR
                        </button>
                        <button
                          onClick={() => handleDecision(quote._id, 'reject')}
                          className="btn-quote reject"
                        >
                          RECHAZAR
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {quote.status === 'accepted' && (
                  <p className="status-message success">
                    Aprobada – En espera de entrega
                  </p>
                )}

                {quote.status === 'pending' && (
                  <p className="status-message pending">
                    Esperando cotización del administrador...
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default QuotesSection;