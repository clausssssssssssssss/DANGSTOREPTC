import React from 'react';
import { useOrders } from '../hooks/useOrders';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const OrderHistory = () => {
  const { orders, loading, error } = useOrders();

  if (loading) return <div>Cargando historial...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-6">Historial de Pedidos</h1>
      
      {orders.length === 0 ? (
        <p>No hay pedidos registrados</p>
      ) : (
        <div className="space-y-4">
          {orders.map(order => (
            <div key={order.id} className="border rounded-lg p-4 shadow-sm">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-semibold">
                  Pedido #{order.id.slice(-6).toUpperCase()}
                </h3>
                <span className={`px-2 py-1 text-xs rounded-full ${
                  order.status === 'completado' ? 'bg-green-100 text-green-800' :
                  order.status === 'cancelado' ? 'bg-red-100 text-red-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {order.status}
                </span>
              </div>
              
              <p className="text-sm text-gray-600 mb-2">
                {format(new Date(order.date), "PPPpp", { locale: es })}
              </p>
              
              <div className="mb-2">
                {order.items.map(item => (
                  <div key={item.product._id} className="flex justify-between py-1">
                    <span>{item.product.name} x {item.quantity}</span>
                    <span>${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
              
              <div className="border-t pt-2 flex justify-between font-bold">
                <span>Total:</span>
                <span>${order.total.toFixed(2)}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrderHistory;