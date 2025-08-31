import React, { useState } from 'react';
import '../styles/LoginForm.css';

const LoginForm = ({ onLogin, onClose, error }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const success = onLogin(username, password);
    if (success) {
      setUsername('');
      setPassword('');
    }
  };

  return (
    <div className="login-overlay">
      <div className="login-modal">
        <button className="close-btn" onClick={onClose}>×</button>
        
        <h2>🔐 Acceso Administrador</h2>
        
        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label>Usuario:</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="admin"
              required
            />
          </div>
          
          <div className="form-group">
            <label>Contraseña:</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="admin123"
              required
            />
          </div>
          
          {error && <div className="error-message">{error}</div>}
          
          <button type="submit" className="login-submit-btn">
            Iniciar Sesión
          </button>
        </form>
        
        <div className="login-help">
          <p>🔍 Usuario: <strong>admin</strong></p>
          <p>🔑 Contraseña: <strong>admin123</strong></p>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;