import React, { useEffect, useState } from 'react';
import { User, AlertTriangle } from 'lucide-react';

const UserSection = () => {
  const [user, setUser] = useState({});
  const token = localStorage.getItem('token');

  useEffect(() => {
    fetch('/api/profile', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setUser(data))
      .catch(err => console.error(err));
  }, []);

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
      <div className="verification-badge">
        <AlertTriangle className="verification-badge-icon" />
        Verificado
      </div>
    </div>
  );
};

export default UserSection;
