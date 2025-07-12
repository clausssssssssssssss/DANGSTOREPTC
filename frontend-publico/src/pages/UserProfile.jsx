import React, { useState } from 'react';
import {
  Heart, ShoppingCart, User, Gift, LogOut,
} from 'lucide-react';
import './UserProfile.css';

import PersonalDataSection from '../components/profile/PersonalDataSection';
import OrdersSection from '../components/profile/OrdersSection';
import FavoritesSection from '../components/profile/FavoritesSection';
import PasswordSection from '../components/profile/PasswordSection';
import UserSection from '../components/profile/UserSection';

const UserProfile = () => {
  const [activeSection, setActiveSection] = useState('personal');

  const renderSection = () => {
    switch (activeSection) {
      case 'personal':
        return <PersonalDataSection />;
      case 'orders':
        return <OrdersSection />;
      case 'favorites':
        return <FavoritesSection />;
      case 'password':
        return <PasswordSection />;
      case 'quotes':
        return (
          <div className="content-card">
            <div className="card-header">
              <div className="card-title">
                <Gift />
                <h3>Cotizaciones</h3>
              </div>
            </div>
            <p>Aquí puedes ver las cotizaciones de tus encargos personalizados cuando estén disponibles.</p>
          </div>
        );
      case 'customOrders':
        return (
          <div className="content-card">
            <div className="card-header">
              <div className="card-title">
                <ShoppingCart />
                <h3>Encargos Personalizados</h3>
              </div>
            </div>
            <p>Gestiona tus encargos personalizados. Aquí aparecerán cuando los realices.</p>
          </div>
        );
      case 'logout':
        return (
          <div className="logout-content">
            <LogOut className="logout-icon" />
            <h2 className="logout-title">¿Seguro que deseas cerrar sesión?</h2>
            <p className="logout-subtitle">Perderás el acceso a tu cuenta en este dispositivo.</p>
            <div className="logout-actions">
              <button className="logout-button cancel" onClick={() => setActiveSection('personal')}>Cancelar</button>
              <button className="logout-button confirm" onClick={() => {
                localStorage.removeItem('token');
                window.location.reload();
              }}>
                Cerrar sesión
              </button>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="user-profile-container">
      <div className="content-layout">
        <aside className="sidebar">
          <div className="sidebar-card">
            <UserSection />
            <nav className="nav-buttons">
              <button
                onClick={() => setActiveSection('personal')}
                className={`nav-button ${activeSection === 'personal' ? 'active' : ''}`}>
                <User className="nav-button-icon" /> Datos Personales
              </button>
              <button
                onClick={() => setActiveSection('orders')}
                className={`nav-button ${activeSection === 'orders' ? 'active' : ''}`}>
                <ShoppingCart className="nav-button-icon" /> Pedidos
              </button>
              <button
                onClick={() => setActiveSection('favorites')}
                className={`nav-button ${activeSection === 'favorites' ? 'active' : ''}`}>
                <Heart className="nav-button-icon" /> Favoritos
              </button>
              <button
                onClick={() => setActiveSection('password')}
                className={`nav-button ${activeSection === 'password' ? 'active' : ''}`}>
                🔒 Cambiar Contraseña
              </button>
              <button
                onClick={() => setActiveSection('quotes')}
                className={`nav-button ${activeSection === 'quotes' ? 'active' : ''}`}>
                <Gift className="nav-button-icon" /> Cotizaciones
              </button>
              <button
                onClick={() => setActiveSection('customOrders')}
                className={`nav-button ${activeSection === 'customOrders' ? 'active' : ''}`}>
                📦 Encargos Personalizados
              </button>
              <button
                onClick={() => setActiveSection('logout')}
                className={`nav-button logout ${activeSection === 'logout' ? 'active' : ''}`}>
                <LogOut className="nav-button-icon" /> Cerrar Sesión
              </button>
            </nav>
          </div>
        </aside>

        <main className="content-area">
          <div className="section-content">
            {renderSection()}
          </div>
        </main>
      </div>
    </div>
  );
};

export default UserProfile;
