import React, { useEffect, useState } from 'react';
import { Gift } from 'lucide-react';
import { toast } from 'react-toastify';

const API_URL = import.meta.env.VITE_API_URL || '';

const QuotesSection = ({ setHasQuotesFlag }) => {
  const [quotes, setQuotes] = useState([]);
  const [loadingQuotes, setLoadingQuotes] = useState(false);
  const [errorQuotes, setErrorQuotes] = useState('');

  // --- Carga inicial de cotizaciones ---
  useEffect(() => {
    const fetchQuotes = async () => {
      setLoadingQuotes(true);
      setErrorQuotes('');
      try {
        const res = await fetch(`${API_URL}/api/custom-orders/me`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        if (!res.ok) throw new Error(`Status ${res.status}`);
        const data = await res.json();

        // Traemos cotizaciones 'quoted', 'pending' y 'accepted'
        const filtered = data.filter(
          (o) => o.status === 'quoted' || o.status === 'pending' || o.status === 'accepted'
        );

        setQuotes(filtered);
        // Puntito de notificación si hay alguna 'quoted'
        setHasQuotesFlag(filtered.some((o) => o.status === 'quoted'));
      } catch (err) {
        setErrorQuotes(`Error: ${err.message || err}`);
      } finally {
        setLoadingQuotes(false);
      }
    };
    fetchQuotes();
  }, []);

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
          // Rechazado: eliminar de la lista
          const remaining = q.filter((item) => item._id !== orderId);
          setHasQuotesFlag(remaining.some((o) => o.status === 'quoted'));
          return remaining;
        }
      });

      toast.success(decision === 'accept' ? 'Cotización aceptada' : 'Cotización rechazada');
    } catch (err) {
      console.error(err);
      toast.error('Error al procesar la decisión');
    }
  };

  if (loadingQuotes) return <p>Cargando cotizaciones...</p>;
  if (errorQuotes) return <p className="error-message">{errorQuotes}</p>;
  if (quotes.length === 0)
    return (
      <div className="empty-state">
        <Gift size={48} />
        <p>No tienes cotizaciones nuevas.</p>
      </div>
    );

  return (
    <div className="quotes-list">
      {quotes.map((q) => (
        <div key={q._id} className="quote-card">
          <div className="quote-image">
            {q.imageUrl ? (
              <img
                src={`${API_URL}${q.imageUrl}`}
                alt={q.modelType}
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
            ) : null}
            <div
              className="quote-placeholder"
              style={{ display: q.imageUrl ? 'none' : 'flex' }}
            >
              <Gift size={24} />
            </div>
          </div>

          <div className="quote-details">
            <h4>{q.modelType}</h4>
            <p>{q.description}</p>
            {q.price && <p>Precio: ${q.price}</p>}

            {q.status === 'quoted' && (
              <div className="quote-actions">
                <button
                  onClick={() => handleDecision(q._id, 'accept')}
                  className="btn-quote accept"
                >
                  ACEPTAR
                </button>
                <button
                  onClick={() => handleDecision(q._id, 'reject')}
                  className="btn-quote reject"
                >
                  RECHAZAR
                </button>
              </div>
            )}

            {q.status === 'accepted' && (
              <span className="quote-approved">Aprobada – En espera de entrega</span>
            )}

            {q.status === 'pending' && (
              <p className="pending-label">Esperando cotización...</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default QuotesSection;