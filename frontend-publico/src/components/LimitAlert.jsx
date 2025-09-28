import React from 'react';
import { Alert, AlertDescription, AlertTitle } from './ui/Alert';
import { X, AlertTriangle, ShoppingCart, Package } from 'lucide-react';

const LimitAlert = ({ 
  type, 
  title, 
  message, 
  onClose, 
  show = true,
  variant = 'destructive'
}) => {
  if (!show) return null;

  const getIcon = () => {
    switch (type) {
      case 'order_limit':
        return <ShoppingCart className="h-4 w-4" />;
      case 'stock_limit':
        return <Package className="h-4 w-4" />;
      default:
        return <AlertTriangle className="h-4 w-4" />;
    }
  };

  const getVariant = () => {
    switch (type) {
      case 'order_limit':
        return 'destructive';
      case 'stock_limit':
        return 'warning';
      default:
        return variant;
    }
  };

  return (
    <Alert variant={getVariant()} className="mb-4">
      <div className="flex items-start">
        <div className="flex-shrink-0">
          {getIcon()}
        </div>
        <div className="ml-3 flex-1">
          <AlertTitle className="text-sm font-medium">
            {title}
          </AlertTitle>
          <AlertDescription className="mt-1 text-sm">
            {message}
          </AlertDescription>
        </div>
        {onClose && (
          <div className="ml-auto pl-3">
            <div className="-mx-1.5 -my-1.5">
              <button
                type="button"
                className="inline-flex rounded-md p-1.5 text-current hover:bg-current/10 focus:outline-none focus:ring-2 focus:ring-current focus:ring-offset-2"
                onClick={onClose}
              >
                <span className="sr-only">Cerrar</span>
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </Alert>
  );
};

export default LimitAlert;
