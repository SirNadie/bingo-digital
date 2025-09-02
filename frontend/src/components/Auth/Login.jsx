import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { authAPI } from '../../services/api';
import './Auth.css';

const Login = () => {
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      const response = await authAPI.login(phone);
      setMessage(response.data.message);
      // Redirigir a verificación de OTP
      setTimeout(() => {
        window.location.href = `/verify?phone=${encodeURIComponent(phone)}`;
      }, 1500);
    } catch (error) {
      setError(error.response?.data?.detail || 'Error al enviar código');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>🎯 Iniciar Sesión</h2>
        <p>Ingresa tu número de teléfono para recibir un código de verificación</p>
        
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="phone">Número de Teléfono</label>
            <input
              type="tel"
              id="phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+1234567890"
              required
              pattern="^\+?[1-9]\d{7,14}$"
            />
            <small>Formato internacional: +1234567890</small>
          </div>

          {error && <div className="error-message">{error}</div>}
          {message && <div className="success-message">{message}</div>}

          <button 
            type="submit" 
            disabled={loading || !phone}
            className="btn-primary"
          >
            {loading ? 'Enviando...' : 'Enviar Código'}
          </button>
        </form>

        <div className="auth-footer">
          <p>¿Primera vez? Se creará una cuenta automáticamente</p>
        </div>
      </div>
    </div>
  );
};

export default Login;