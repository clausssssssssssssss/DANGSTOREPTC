    import React, { useState } from 'react';
    import { Heart, ShoppingCart, User, Gift, LogOut, AlertTriangle, Eye, EyeOff, Save, Edit2 } from 'lucide-react';
    import './UserProfile.css';

    const UserProfile = () => {
    const [activeSection, setActiveSection] = useState('personal');
    const [isEditing, setIsEditing] = useState(false);
    
    const [personalData, setPersonalData] = useState({
        firstName: 'Ana',
        lastName: 'Gómez',
        email: 'ana.gomez@example.com',
        phone: '+502 1234 5678',
        birthDate: '1990-05-15',
        gender: 'femenino',
        address: '12 Calle 3-45 Zona 10',
        city: 'El salvador',
        country: 'El salvadorla'
    });

    const [favorites, setFavorites] = useState([
        { id: 1, name: 'Llavero Link', subtitle: 'The legend of Zelda', isFavorite: true },
        { id: 2, name: 'Funko Pop Mario', subtitle: 'Super Mario Bros', isFavorite: true },
        { id: 3, name: 'Pulsera Pandora', subtitle: 'Colección especial', isFavorite: true },
        { id: 4, name: 'Taza Harry Potter', subtitle: 'Colección Hogwarts', isFavorite: true }
    ]);

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

    const toggleFavorite = (id) => {
        setFavorites(favorites.map(item => 
        item.id === id ? { ...item, isFavorite: !item.isFavorite } : item
        ));
    };

    const handlePersonalDataChange = (field, value) => {
        setPersonalData(prev => ({ ...prev, [field]: value }));
    };

    const handlePasswordChange = (field, value) => {
        setPasswordData(prev => ({ ...prev, [field]: value }));
    };

    const togglePasswordVisibility = (field) => {
        setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }));
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
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    };

    const handleSavePersonalData = () => {
        setIsEditing(false);
        console.log('Datos guardados:', personalData);
    };

    const SectionTitle = () => {
        const titles = {
        personal: 'PERFIL DE USUARIO',
        orders: 'MIS PEDIDOS',
        favorites: 'MIS FAVORITOS',
        quotes: 'MIS COTIZACIONES',
        logout: 'CERRAR SESIÓN'
        };
        
        return (
        <div className="section-title no-animation">
            <div className="section-title-content">
            <h2>{titles[activeSection]}</h2>
            </div>
        </div>
        );
    };

    const UserSection = () => (
        <div className="user-section no-animation">
        <div className="user-info">
            <div className="user-avatar">
            <User className="user-avatar-icon" />
            </div>
            <div className="user-details">
            <h3>
                {personalData.firstName || personalData.lastName 
                ? `${personalData.firstName} ${personalData.lastName}` 
                : 'Usuario Usuario'}
            </h3>
            <p>{personalData.email || 'usuario@ejemplo.com'}</p>
            </div>
        </div>
        
        <div className="verification-badge no-animation">
            <AlertTriangle className="verification-badge-icon" />
            <span>Perfil verificado</span>
        </div>
        </div>
    );

    const PersonalDataSection = () => (
        <div className="section-content no-animation">
        <UserSection />
        
        <div className="content-card no-animation">
            <div className="card-header">
            <div className="card-title">
                <User className="card-title-icon" />
                <h3>Información Personal</h3>
            </div>
            <button
                onClick={() => setIsEditing(!isEditing)}
                className="edit-button no-animation"
            >
                <Edit2 className="edit-button-icon" />
                <span>{isEditing ? 'Cancelar' : 'Editar'}</span>
            </button>
            </div>

            <div className="form-grid">
            <div className="form-field">
                <label className="form-label">Nombre</label>
                <input
                type="text"
                value={personalData.firstName}
                onChange={(e) => handlePersonalDataChange('firstName', e.target.value)}
                disabled={!isEditing}
                className="form-input no-animation"
                />
            </div>
            
            <div className="form-field">
                <label className="form-label">Apellido</label>
                <input
                type="text"
                value={personalData.lastName}
                onChange={(e) => handlePersonalDataChange('lastName', e.target.value)}
                disabled={!isEditing}
                className="form-input no-animation"
                />
            </div>
            
            <div className="form-field">
                <label className="form-label">Correo Electrónico</label>
                <input
                type="email"
                value={personalData.email}
                onChange={(e) => handlePersonalDataChange('email', e.target.value)}
                disabled={!isEditing}
                className="form-input no-animation"
                />
            </div>
            
            <div className="form-field">
                <label className="form-label">Teléfono</label>
                <input
                type="tel"
                value={personalData.phone}
                onChange={(e) => handlePersonalDataChange('phone', e.target.value)}
                disabled={!isEditing}
                className="form-input no-animation"
                />
            </div>
            
            <div className="form-field">
                <label className="form-label">Fecha de Nacimiento</label>
                <input
                type="date"
                value={personalData.birthDate}
                onChange={(e) => handlePersonalDataChange('birthDate', e.target.value)}
                disabled={!isEditing}
                className="form-input no-animation"
                />
            </div>
            
            <div className="form-field">
                <label className="form-label">Género</label>
                <select
                value={personalData.gender}
                onChange={(e) => handlePersonalDataChange('gender', e.target.value)}
                disabled={!isEditing}
                className="form-select no-animation"
                >
                <option value="">Selecciona tu género</option>
                <option value="masculino">Masculino</option>
                <option value="femenino">Femenino</option>
                <option value="otro">Otro</option>
                <option value="prefiero-no-decir">Prefiero no decir</option>
                </select>
            </div>
            
            <div className="form-field full-width">
                <label className="form-label">Dirección</label>
                <input
                type="text"
                value={personalData.address}
                onChange={(e) => handlePersonalDataChange('address', e.target.value)}
                disabled={!isEditing}
                className="form-input no-animation"
                placeholder="Ingresa tu dirección completa"
                />
            </div>
            
            <div className="form-field">
                <label className="form-label">Ciudad</label>
                <input
                type="text"
                value={personalData.city}
                onChange={(e) => handlePersonalDataChange('city', e.target.value)}
                disabled={!isEditing}
                className="form-input no-animation"
                placeholder="Ciudad"
                />
            </div>
            
            <div className="form-field">
                <label className="form-label">País</label>
                <select
                value={personalData.country}
                onChange={(e) => handlePersonalDataChange('country', e.target.value)}
                disabled={!isEditing}
                className="form-select no-animation"
                >
                <option value="">Selecciona tu país</option>
                <option value="El salvadorla">El salvadorla</option>
                <option value="mexico">México</option>
                <option value="colombia">Colombia</option>
                <option value="espana">España</option>
                <option value="argentina">Argentina</option>
                </select>
            </div>
            </div>
            
            {isEditing && (
            <div className="form-actions">
                <button
                onClick={handleSavePersonalData}
                className="save-button no-animation"
                >
                <Save className="save-button-icon" />
                <span>Guardar Cambios</span>
                </button>
            </div>
            )}
        </div>

        <div className="content-card no-animation">
            <div className="password-header">
            <div className="password-icon">
                <span>🔒</span>
            </div>
            <h3 className="password-title">Cambiar Contraseña</h3>
            </div>
            
            <div className="password-section">
            <div className="password-fields">
                <div className="form-field">
                <label className="form-label">Contraseña Actual</label>
                <div className="password-field">
                    <input
                    type={showPasswords.current ? 'text' : 'password'}
                    value={passwordData.currentPassword}
                    onChange={(e) => handlePasswordChange('currentPassword', e.target.value)}
                    className="password-input no-animation"
                    placeholder="Ingresa tu contraseña actual"
                    />
                    <button
                    type="button"
                    onClick={() => togglePasswordVisibility('current')}
                    className="password-toggle no-animation"
                    >
                    {showPasswords.current ? <EyeOff className="password-toggle-icon" /> : <Eye className="password-toggle-icon" />}
                    </button>
                </div>
                </div>
                
                <div className="form-field">
                <label className="form-label">Nueva Contraseña</label>
                <div className="password-field">
                    <input
                    type={showPasswords.new ? 'text' : 'password'}
                    value={passwordData.newPassword}
                    onChange={(e) => handlePasswordChange('newPassword', e.target.value)}
                    className="password-input no-animation"
                    placeholder="Ingresa tu nueva contraseña"
                    />
                    <button
                    type="button"
                    onClick={() => togglePasswordVisibility('new')}
                    className="password-toggle no-animation"
                    >
                    {showPasswords.new ? <EyeOff className="password-toggle-icon" /> : <Eye className="password-toggle-icon" />}
                    </button>
                </div>
                </div>
                
                <div className="form-field">
                <label className="form-label">Confirmar Nueva Contraseña</label>
                <div className="password-field">
                    <input
                    type={showPasswords.confirm ? 'text' : 'password'}
                    value={passwordData.confirmPassword}
                    onChange={(e) => handlePasswordChange('confirmPassword', e.target.value)}
                    className="password-input no-animation"
                    placeholder="Confirma tu nueva contraseña"
                    />
                    <button
                    type="button"
                    onClick={() => togglePasswordVisibility('confirm')}
                    className="password-toggle no-animation"
                    >
                    {showPasswords.confirm ? <EyeOff className="password-toggle-icon" /> : <Eye className="password-toggle-icon" />}
                    </button>
                </div>
                </div>
                
                {passwordStatus && (
                <div className={`password-status no-animation ${
                    passwordStatus.includes('correctamente') ? 'success' : 'error'
                }`}>
                    {passwordStatus}
                </div>
                )}
                
                <button
                onClick={handlePasswordSubmit}
                className="password-submit no-animation"
                >
                Actualizar Contraseña
                </button>
            </div>
            </div>
        </div>
        </div>
    );

    const OrdersSection = () => (
        <div className="section-content no-animation">
        <UserSection />
        <div className="content-card no-animation">
            <h3 className="history-title">Mis Pedidos</h3>
            <div className="orders-list">
            {[1, 2, 3].map((order) => (
                <div key={order} className="order-item no-animation">
                <div className="order-header green">
                    <span className="order-id green">PAGADO #{order}</span>
                    <span className="order-date">5 de abril, 2025</span>
                </div>
                <div className="order-content">
                    <div className="order-image green">
                    <span>Imagen</span>
                    </div>
                    <div className="order-details">
                    <h4 className="order-name">Llavero Link</h4>
                    <p className="order-subtitle">The legend of Zelda</p>
                    <p className="order-price green">$35.00</p>
                    </div>
                    <div className="order-actions">
                    <button className="action-button purple no-animation">
                        Completado
                    </button>
                    <button className="action-button yellow no-animation">
                        Ver detalles
                    </button>
                    </div>
                </div>
                </div>
            ))}
            </div>
        </div>
        </div>
    );

    const FavoritesSection = () => (
        <div className="section-content no-animation">
        <UserSection />
        <div className="content-card no-animation">
            <h3 className="history-title">Mis Favoritos</h3>
            <div className="favorites-grid">
            {favorites.map((item) => (
                <div key={item.id} className="favorite-item no-animation">
                <button
                    onClick={() => toggleFavorite(item.id)}
                    className="favorite-button no-animation"
                >
                    <Heart className={`favorite-icon ${item.isFavorite ? 'active' : 'inactive'}`} />
                </button>
                <div className="favorite-image-container">
                    <div className="favorite-image">
                    <span>Imagen del producto</span>
                    </div>
                </div>
                <div className="favorite-details">
                    <h4 className="favorite-name">{item.name}</h4>
                    <p className="favorite-subtitle">{item.subtitle}</p>
                    <p className="favorite-price">$25.00</p>
                </div>
                </div>
            ))}
            </div>
        </div>
        </div>
    );

    const QuotesSection = () => (
        <div className="section-content no-animation">
        <UserSection />
        <div className="content-card no-animation">
            <h3 className="history-title">Mis Cotizaciones</h3>
            <div className="quotes-filters">
            <button className="filter-button active no-animation">
                Completado
            </button>
            <button className="filter-button inactive no-animation">
                Pendientes
            </button>
            </div>
            <div className="orders-list">
            {[1, 2, 3].map((quote) => (
                <div key={quote} className="order-item no-animation">
                <div className="order-header blue">
                    <span className="order-id blue">COTIZACIÓN #{quote}</span>
                    <span className="order-date">5 de abril, 2025</span>
                </div>
                <div className="order-content">
                    <div className="order-image blue">
                    <span>Imagen</span>
                    </div>
                    <div className="order-details">
                    <h4 className="order-name">Llavero Link</h4>
                    <p className="order-subtitle">The legend of Zelda</p>
                    <p className="order-price blue">$35.00</p>
                    </div>
                    <div className="order-actions">
                    <button className="action-button purple no-animation">
                        Aprobar
                    </button>
                    <button className="action-button yellow no-animation">
                        Ver detalles
                    </button>
                    </div>
                </div>
                </div>
            ))}
            </div>
        </div>
        </div>
    );

    const LogoutSection = () => (
        <div className="section-content no-animation">
        <UserSection />
        <div className="content-card no-animation">
            <div className="logout-content">
            <LogOut className="logout-icon" />
            <h4 className="logout-title">¿Quieres salir de tu cuenta?</h4>
            <p className="logout-subtitle">
                Tu sesión se cerrará y tendrás que iniciar sesión nuevamente
            </p>
            <div className="logout-actions">
                <button className="logout-button cancel no-animation">
                Cancelar
                </button>
                <button className="logout-button confirm no-animation">
                Cerrar Sesión
                </button>
            </div>
            </div>
        </div>
        </div>
    );

    const renderActiveSection = () => {
        switch (activeSection) {
        case 'personal': return <PersonalDataSection />;
        case 'orders': return <OrdersSection />;
        case 'favorites': return <FavoritesSection />;
        case 'quotes': return <QuotesSection />;
        case 'logout': return <LogoutSection />;
        default: return <PersonalDataSection />;
        }
    };

    return (
        <div className="user-profile-container no-animation">
        <SectionTitle />
        
        <div className="main-content">
            <div className="content-layout">
            <div className="sidebar">
                <div className="sidebar-card no-animation">
                <div className="nav-buttons">
                    <button
                    onClick={() => setActiveSection('personal')}
                    className={`nav-button no-animation ${activeSection === 'personal' ? 'active' : ''}`}
                    >
                    <User className="nav-button-icon" />
                    <span>Datos Personales</span>
                    </button>
                    <button
                    onClick={() => setActiveSection('orders')}
                    className={`nav-button no-animation ${activeSection === 'orders' ? 'active' : ''}`}
                    >
                    <ShoppingCart className="nav-button-icon" />
                    <span>Mis Pedidos</span>
                    </button>
                    <button
                    onClick={() => setActiveSection('favorites')}
                    className={`nav-button no-animation ${activeSection === 'favorites' ? 'active' : ''}`}
                    >
                    <Heart className="nav-button-icon" />
                    <span>Favoritos</span>
                    </button>
                    <button
                    onClick={() => setActiveSection('quotes')}
                    className={`nav-button no-animation ${activeSection === 'quotes' ? 'active' : ''}`}
                    >
                    <Gift className="nav-button-icon" />
                    <span>Cotizaciones</span>
                    </button>
                    <button
                    onClick={() => setActiveSection('logout')}
                    className={`nav-button logout no-animation ${activeSection === 'logout' ? 'active' : ''}`}
                    >
                    <LogOut className="nav-button-icon" />
                    <span>Cerrar Sesión</span>
                    </button>
                </div>
                </div>
            </div>
            
            <div className="content-area">
                {renderActiveSection()}
            </div>
            </div>
        </div>
        </div>
    );
    };

    export default UserProfile;