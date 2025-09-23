import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { User, Mail, Phone, MapPin, Edit, Save, X } from 'lucide-react';

// URL del servidor local para desarrollo
const API_BASE = 'https://dangstoreptc-production.up.railway.app/api';

const UserSection = ({ userId }) => {
  const [user, setUser] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_BASE}/profile`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    })
    .then(res => res.json())
    .then(data => {
      setUser(data);
      setLoading(false);
    })
    .catch(err => {
      console.error('Error fetching user:', err);
      setLoading(false);
    });
  }, [userId]);

  return (
    <div className="user-section">
      <div className="user-info">
        <div className="user-avatar">
          <User className="user-avatar-icon" />
        </div>
        <div className="user-details">
          <h3>{user.name}</h3>
          <p>{user.email}</p>
        </div>
      </div>
    </div>
  );
};

export default UserSection;
