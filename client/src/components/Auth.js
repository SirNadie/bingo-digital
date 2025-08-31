import React, { useState } from 'react';
import './Auth.css';

const Auth = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
      const response = await fetch(`http://localhost:5000${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok) {
        if (data.success) {
          // Guardar token en localStorage
          localStorage.setItem('token', data.token);
          localStorage.setItem('user', JSON.stringify(data.user));
          onLogin(data.user);
        }
      } else {
        setMessage(data.error || 'Error en la autenticación');
      }
    } catch (error) {
      setMessage('Error de conexión con el servidor');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-form">
        <h2><i className="fas fa-dice"></i> Bingo Digital</h2>
        
        {message && (
          <div className={`message ${message.includes('Error') ? 'error' : 'success'}`}>
            {message}
          </div>
        )}

        {isLogin ? (
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="username">Usuario:</label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                required
                disabled={loading}
              />
            </div>
            <div className="form-group">
              <label htmlFor="password">Contraseña:</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                disabled={loading}
              />
            </div>
            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? 'Cargando...' : (
                <>
                  <i className="fas fa-sign-in-alt"></i> Iniciar Sesión
                </>
              )}
            </button>
            <div className="auth-options">
              <p>¿No tienes cuenta? <span onClick={() => setIsLogin(false)}>Regístrate aquí</span></p>
            </div>
          </form>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="new-username">Usuario:</label>
              <input
                type="text"
                id="new-username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                required
                disabled={loading}
              />
            </div>
            <div className="form-group">
              <label htmlFor="email">Correo electrónico:</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                disabled={loading}
              />
            </div>
            <div className="form-group">
              <label htmlFor="new-password">Contraseña:</label>
              <input
                type="password"
                id="new-password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                disabled={loading}
                minLength="6"
              />
            </div>
            <button 
              type="submit" 
              className="btn btn-secondary"
              disabled={loading}
            >
              {loading ? 'Cargando...' : (
                <>
                  <i className="fas fa-user-plus"></i> Registrarse
                </>
              )}
            </button>
            <div className="auth-options">
              <p>¿Ya tienes cuenta? <span onClick={() => setIsLogin(true)}>Inicia sesión aquí</span></p>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default Auth;