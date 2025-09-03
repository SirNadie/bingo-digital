import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { authAPI } from '../../services/api';
import './Auth.css';

const VerifyOTP = () => {
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [phone, setPhone] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  useEffect(() => {
    // Obtener teléfono de la URL
    const urlParams = new URLSearchParams(window.location.search);
    const phoneParam = urlParams.get('phone');
    if (phoneParam) {
      setPhone(phoneParam);
    } else {
      navigate('/login');
    }
  }, [navigate]);

  const handleCodeChange = (index, value) => {
    if (!/^\d?$/.test(value)) return;

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    // Auto-focus al siguiente input
    if (value && index < 5) {
      document.getElementById(`code-${index + 1}`).focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const fullCode = code.join('');
    
    if (fullCode.length !== 6) {
      setError('El código debe tener 6 dígitos');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await authAPI.verify(phone, fullCode);
      login(response.data.user, response.data.token);
      navigate('/dashboard');
    } catch (error) {
      setError(error.response?.data?.detail || 'Código inválido');
      setCode(['', '', '', '', '', '']);
      document.getElementById('code-0').focus();
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      document.getElementById(`code-${index - 1}`).focus();
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>🔐 Verificar Código</h2>
        <p>Ingresa el código de 6 dígitos enviado a {phone}</p>
        
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="otp-container">
            {code.map((digit, index) => (
              <input
                key={index}
                id={`code-${index}`}
                type="text"
                maxLength="1"
                value={digit}
                onChange={(e) => handleCodeChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                className="otp-input"
                autoFocus={index === 0}
                disabled={loading}
              />
            ))}
          </div>

          {error && <div className="error-message">{error}</div>}

          <button 
            type="submit" 
            disabled={loading || code.join('').length !== 6}
            className="btn-primary"
          >
            {loading ? 'Verificando...' : 'Verificar'}
          </button>
        </form>

        <div className="auth-footer">
          <button 
            type="button" 
            className="btn-link"
            onClick={() => navigate('/login')}
          >
            ↶ Cambiar número
          </button>
        </div>
      </div>
    </div>
  );
};

export default VerifyOTP;