import React, { useState } from 'react';
import { Heart, ShoppingCart, User, Gift, LogOut, Search, Bell, AlertTriangle } from 'lucide-react';

const UserProfile = () => {
  const [activeSection, setActiveSection] = useState('personal');
  
  const [favorites, setFavorites] = useState([
    { id: 1, name: 'Llavero Link', subtitle: 'The legend of Zelda', image: '/api/placeholder/120/120', isFavorite: true },
    { id: 2, name: 'Llavero Link', subtitle: 'The legend of Zelda', image: '/api/placeholder/120/120', isFavorite: true },
    { id: 3, name: 'Llavero Link', subtitle: 'The legend of Zelda', image: '/api/placeholder/120/120', isFavorite: true },
    { id: 4, name: 'Llavero Link', subtitle: 'The legend of Zelda', image: '/api/placeholder/120/120', isFavorite: true }
  ]);

  const toggleFavorite = (id) => {
    setFavorites(favorites.map(item => 
      item.id === id ? { ...item, isFavorite: !item.isFavorite } : item
    ));
  };

  const Header = () => (
    <div className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-pink-500 rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-sm">D</span>
          </div>
          <h1 className="text-xl font-bold text-gray-800">DANGSTORE</h1>
        </div>
        <div className="flex items-center space-x-6">
          <span className="text-sm text-gray-600 hover:text-gray-800 cursor-pointer">Encargo</span>
          <span className="text-sm text-gray-600 hover:text-gray-800 cursor-pointer">Catalogo</span>
          <span className="text-sm text-gray-600 hover:text-gray-800 cursor-pointer">Contacto</span>
          <span className="text-sm text-gray-600 hover:text-gray-800 cursor-pointer">Acerca</span>
          <div className="flex items-center space-x-3">
            <Search className="w-5 h-5 text-gray-600 cursor-pointer hover:text-gray-800" />
            <Bell className="w-5 h-5 text-gray-600 cursor-pointer hover:text-gray-800" />
            <ShoppingCart className="w-5 h-5 text-gray-600 cursor-pointer hover:text-gray-800" />
          </div>
        </div>
      </div>
    </div>
  );

  const SectionTitle = () => {
    const titles = {
      personal: 'PERFIL DE USUARIO (TENDRA SCROLL)',
      orders: 'PERFIL DE USUARIO (Mis pedidos)',
      favorites: 'PERFIL DE USUARIO (Favoritos)',
      quotes: 'PERFIL DE USUARIO (Cotizacion)',
      logout: 'PERFIL DE USUARIO (Cerrar sesion)'
    };
    
    return (
      <div className="bg-gradient-to-br from-purple-400 via-purple-500 to-pink-500 text-white text-center py-6">
        <h2 className="text-2xl font-bold">{titles[activeSection]}</h2>
      </div>
    );
  };

  const UserSection = () => (
    <div className="bg-white px-6 py-6">
      <div className="flex items-center space-x-4 mb-6">
        <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
          <User className="w-8 h-8 text-gray-500" />
        </div>
        <div>
          <h3 className="font-semibold text-gray-800">Usuario Usuario</h3>
          <p className="text-sm text-gray-600">usuario@ejemplo.com</p>
        </div>
      </div>
      
      <div className="flex items-center space-x-2 mb-4">
        <AlertTriangle className="w-5 h-5 text-orange-500" />
        <span className="text-sm text-gray-700">Vl perfil</span>
      </div>
    </div>
  );

  const PersonalDataSection = () => {
    const [passwordData, setPasswordData] = useState({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
    const [showPasswords, setShowPasswords] = useState({
      current: false,
      new: false,
      confirm: false
    });
    const [passwordStatus, setPasswordStatus] = useState('');

    const handlePasswordChange = (field, value) => {
      setPasswordData(prev => ({
        ...prev,
        [field]: value
      }));
    };

    const togglePasswordVisibility = (field) => {
      setShowPasswords(prev => ({
        ...prev,
        [field]: !prev[field]
      }));
    };

    const handlePasswordSubmit = () => {
      if (passwordData.newPassword !== passwordData.confirmPassword) {
        setPasswordStatus('Las contraseñas no coinciden');
        return;
      }
      if (passwordData.newPassword.length < 6) {
        setPasswordStatus('La contraseña debe tener al menos 6 caracteres');
        return;
      }
      setPasswordStatus('Contraseña actualizada correctamente');
      // Reset form
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    };

    return (
      <div className="bg-white min-h-screen">
        <UserSection />
        <div className="px-6 pb-6">
          <h3 className="text-lg font-semibold mb-6 text-center">Datos Personales</h3>
          
          {/* Información Personal */}
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-6 mb-6 border border-purple-100">
            <div className="flex items-center mb-4">
              <User className="w-5 h-5 text-purple-600 mr-2" />
              <h4 className="font-medium text-gray-800">Información Personal</h4>
            </div>
            <div className="space-y-4">
              <div className="flex flex-col space-y-1">
                <label className="text-sm font-medium text-gray-700">Nombre Completo:</label>
                <span className="text-sm text-gray-900 bg-white px-3 py-2 rounded-md border">Gael Rodríguez</span>
              </div>
              <div className="flex flex-col space-y-1">
                <label className="text-sm font-medium text-gray-700">Correo Electrónico:</label>
                <span className="text-sm text-gray-900 bg-white px-3 py-2 rounded-md border">gael@ejemplo.com</span>
              </div>
              <div className="flex flex-col space-y-1">
                <label className="text-sm font-medium text-gray-700">Fecha de Nacimiento:</label>
                <span className="text-sm text-gray-900 bg-white px-3 py-2 rounded-md border">15/03/1995</span>
              </div>
              <div className="flex flex-col space-y-1">
                <label className="text-sm font-medium text-gray-700">Género:</label>
                <span className="text-sm text-gray-900 bg-white px-3 py-2 rounded-md border">Masculino</span>
              </div>
              <div className="flex flex-col space-y-1">
                <label className="text-sm font-medium text-gray-700">Teléfono:</label>
                <span className="text-sm text-gray-900 bg-white px-3 py-2 rounded-md border">+502 1234-5678</span>
              </div>
            </div>
          </div>

          {/* Cambiar Contraseña */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 mb-6 border border-blue-100">
            <div className="flex items-center mb-4">
              <span className="text-blue-600 mr-2">🔒</span>
              <h4 className="font-medium text-gray-800">Cambiar Contraseña</h4>
            </div>
            <div className="space-y-4">
              <div className="flex flex-col space-y-1">
                <label className="text-sm font-medium text-gray-700">Contraseña Actual:</label>
                <div className="relative">
                  <input
                    type={showPasswords.current ? 'text' : 'password'}
                    value={passwordData.currentPassword}
                    onChange={(e) => handlePasswordChange('currentPassword', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Ingresa tu contraseña actual"
                  />
                  <button
                    type="button"
                    onClick={() => togglePasswordVisibility('current')}
                    className="absolute right-3 top-2.5 text-gray-500 hover:text-gray-700"
                  >
                    {showPasswords.current ? '🙈' : '👁️'}
                  </button>
                </div>
              </div>
              
              <div className="flex flex-col space-y-1">
                <label className="text-sm font-medium text-gray-700">Nueva Contraseña:</label>
                <div className="relative">
                  <input
                    type={showPasswords.new ? 'text' : 'password'}
                    value={passwordData.newPassword}
                    onChange={(e) => handlePasswordChange('newPassword', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Ingresa tu nueva contraseña"
                  />
                  <button
                    type="button"
                    onClick={() => togglePasswordVisibility('new')}
                    className="absolute right-3 top-2.5 text-gray-500 hover:text-gray-700"
                  >
                    {showPasswords.new ? '🙈' : '👁️'}
                  </button>
                </div>
              </div>
              
              <div className="flex flex-col space-y-1">
                <label className="text-sm font-medium text-gray-700">Confirmar Nueva Contraseña:</label>
                <div className="relative">
                  <input
                    type={showPasswords.confirm ? 'text' : 'password'}
                    value={passwordData.confirmPassword}
                    onChange={(e) => handlePasswordChange('confirmPassword', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Confirma tu nueva contraseña"
                  />
                  <button
                    type="button"
                    onClick={() => togglePasswordVisibility('confirm')}
                    className="absolute right-3 top-2.5 text-gray-500 hover:text-gray-700"
                  >
                    {showPasswords.confirm ? '🙈' : '👁️'}
                  </button>
                </div>
              </div>
              
              {passwordStatus && (
                <div className={`text-sm p-2 rounded-md ${
                  passwordStatus.includes('correctamente') 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-red-100 text-red-700'
                }`}>
                  {passwordStatus}
                </div>
              )}
              
              <button
                onClick={handlePasswordSubmit}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-2 px-4 rounded-md hover:from-purple-700 hover:to-pink-700 transition-all duration-200 font-medium"
              >
                Actualizar Contraseña
              </button>
            </div>
          </div>

          <div className="mt-8 space-y-3">
            <div className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg cursor-pointer">
              <div className="flex items-center space-x-3">
                <User className="w-5 h-5 text-gray-600" />
                <span className="text-sm">Mis pedidos</span>
              </div>
            </div>
            <div className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg cursor-pointer">
              <div className="flex items-center space-x-3">
                <Heart className="w-5 h-5 text-gray-600" />
                <span className="text-sm">Favoritos</span>
              </div>
            </div>
            <div className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg cursor-pointer">
              <div className="flex items-center space-x-3">
                <Gift className="w-5 h-5 text-gray-600" />
                <span className="text-sm">Cotización</span>
              </div>
            </div>
            <div className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg cursor-pointer">
              <div className="flex items-center space-x-3">
                <LogOut className="w-5 h-5 text-gray-600" />
                <span className="text-sm">Cerrar Sesión</span>
              </div>
            </div>
          </div>

          <div className="mt-8 space-y-4">
            <div className="bg-purple-100 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-purple-700">5 de abril, 2025</span>
                <button className="bg-purple-600 text-white px-3 py-1 rounded-full text-xs">Completado</button>
              </div>
              <div className="text-sm text-gray-600 mt-1">Total: Q35.00</div>
            </div>
            <div className="bg-purple-100 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-purple-700">15 de marzo, 2025</span>
                <button className="bg-yellow-500 text-white px-3 py-1 rounded-full text-xs">Ver detalles</button>
              </div>
              <div className="text-sm text-gray-600 mt-1">Total: Q35.00</div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const OrdersSection = () => (
    <div className="bg-white min-h-screen">
      <UserSection />
      <div className="px-6 pb-6">
        <h3 className="text-lg font-semibold mb-6 text-center">Mis pedidos</h3>
        <div className="space-y-4">
          {[1, 2, 3].map((order) => (
            <div key={order} className="bg-white border rounded-lg overflow-hidden shadow-sm">
              <div className="bg-green-100 px-4 py-3 flex justify-between items-center">
                <span className="text-sm font-medium text-green-700">PAGADO #{order}</span>
                <span className="text-sm text-gray-600">5 de abril, 2025</span>
              </div>
              <div className="p-4">
                <div className="flex items-center space-x-4">
                  <div className="w-20 h-20 bg-green-100 rounded-lg flex items-center justify-center overflow-hidden">
                    <img src="/api/placeholder/80/80" alt="Llavero Link" className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-800">Llavero Link</h4>
                    <p className="text-sm text-gray-600">The legend of Zelda</p>
                  </div>
                  <div className="flex flex-col space-y-2">
                    <button className="px-4 py-1 bg-purple-600 text-white text-sm rounded-full">
                      Completado
                    </button>
                    <button className="px-4 py-1 bg-yellow-500 text-white text-sm rounded-full">
                      Ver detalles
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const FavoritesSection = () => (
    <div className="bg-white min-h-screen">
      <UserSection />
      <div className="px-6 pb-6">
        <h3 className="text-lg font-semibold mb-6 text-center">Mis favoritos</h3>
        <div className="grid grid-cols-2 gap-4">
          {favorites.map((item) => (
            <div key={item.id} className="bg-white border rounded-lg overflow-hidden shadow-sm relative">
              <button
                onClick={() => toggleFavorite(item.id)}
                className="absolute top-2 right-2 z-10 bg-white rounded-full p-1 shadow-sm"
              >
                <Heart 
                  className={`w-5 h-5 ${item.isFavorite ? 'text-red-500 fill-red-500' : 'text-gray-400'}`}
                />
              </button>
              <div className="bg-green-100 p-4">
                <div className="w-full h-32 bg-green-200 rounded-lg flex items-center justify-center overflow-hidden">
                  <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                </div>
              </div>
              <div className="p-3 text-center">
                <h4 className="font-medium text-sm">{item.name}</h4>
                <p className="text-xs text-gray-600">{item.subtitle}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const QuotesSection = () => (
    <div className="bg-white min-h-screen">
      <UserSection />
      <div className="px-6 pb-6">
        <h3 className="text-lg font-semibold mb-6 text-center">Mis cotizaciones</h3>
        <div className="flex justify-center space-x-4 mb-6">
          <button className="px-4 py-2 bg-purple-600 text-white text-sm rounded-full">
            Completado
          </button>
          <button className="px-4 py-2 bg-gray-200 text-gray-700 text-sm rounded-full">
            Pendientes
          </button>
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map((quote) => (
            <div key={quote} className="bg-white border rounded-lg overflow-hidden shadow-sm">
              <div className="bg-green-100 px-4 py-3 flex justify-between items-center">
                <span className="text-sm font-medium text-green-700">PAGADO #{quote}</span>
                <span className="text-sm text-gray-600">5 de abril, 2025</span>
              </div>
              <div className="p-4">
                <div className="flex items-center space-x-4">
                  <div className="w-20 h-20 bg-green-100 rounded-lg flex items-center justify-center overflow-hidden">
                    <img src="/api/placeholder/80/80" alt="Llavero Link" className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-800">Llavero Link</h4>
                    <p className="text-sm text-gray-600">The legend of Zelda</p>
                  </div>
                  <div className="flex flex-col space-y-2">
                    <button className="px-4 py-1 bg-purple-600 text-white text-sm rounded-full">
                      Completado
                    </button>
                    <button className="px-4 py-1 bg-yellow-500 text-white text-sm rounded-full">
                      Ver detalles
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const LogoutSection = () => (
    <div className="bg-white min-h-screen">
      <UserSection />
      <div className="px-6 pb-6">
        <h3 className="text-lg font-semibold mb-6 text-center">Cerrar Sesión</h3>
        <div className="text-center py-20">
          <h4 className="text-xl font-medium mb-8">¿Quieres salir de tu cuenta?</h4>
          <div className="flex justify-center space-x-6">
            <button className="px-8 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors">
              Cancelar
            </button>
            <button className="px-8 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
              Cerrar Sesión
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderActiveSection = () => {
    switch (activeSection) {
      case 'personal':
        return <PersonalDataSection />;
      case 'orders':
        return <OrdersSection />;
      case 'favorites':
        return <FavoritesSection />;
      case 'quotes':
        return <QuotesSection />;
      case 'logout':
        return <LogoutSection />;
      default:
        return <PersonalDataSection />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-4xl mx-auto bg-white shadow-lg">
        <Header />
        <SectionTitle />
        
        {/* Side Navigation */}
        <div className="flex">
          <div className="w-64 bg-white border-r border-gray-200 min-h-screen">
            <div className="p-4">
              <div className="space-y-2">
                <button
                  onClick={() => setActiveSection('personal')}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${
                    activeSection === 'personal' 
                      ? 'bg-purple-100 text-purple-700' 
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <User className="w-5 h-5" />
                  <span className="text-sm">Datos Personales</span>
                </button>
                <button
                  onClick={() => setActiveSection('orders')}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${
                    activeSection === 'orders' 
                      ? 'bg-purple-100 text-purple-700' 
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <ShoppingCart className="w-5 h-5" />
                  <span className="text-sm">Mis Pedidos</span>
                </button>
                <button
                  onClick={() => setActiveSection('favorites')}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${
                    activeSection === 'favorites' 
                      ? 'bg-purple-100 text-purple-700' 
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Heart className="w-5 h-5" />
                  <span className="text-sm">Favoritos</span>
                </button>
                <button
                  onClick={() => setActiveSection('quotes')}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${
                    activeSection === 'quotes' 
                      ? 'bg-purple-100 text-purple-700' 
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Gift className="w-5 h-5" />
                  <span className="text-sm">Cotizaciones</span>
                </button>
                <button
                  onClick={() => setActiveSection('logout')}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${
                    activeSection === 'logout' 
                      ? 'bg-purple-100 text-purple-700' 
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <LogOut className="w-5 h-5" />
                  <span className="text-sm">Cerrar Sesión</span>
                </button>
              </div>
            </div>
          </div>
          
          <div className="flex-1">
            {renderActiveSection()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;