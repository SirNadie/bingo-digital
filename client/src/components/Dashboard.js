import React, { useState, useEffect } from 'react';
import GameList from './GameList';
import UserCards from './UserCards';
import './Dashboard.css';

const Dashboard = ({ user, onLogout }) => {
  const [activeTab, setActiveTab] = useState('games');
  const [userData, setUserData] = useState(user);

  // Actualizar datos del usuario periódicamente
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:5000/api/auth/profile', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          setUserData(data.user);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    fetchUserData();
    const interval = setInterval(fetchUserData, 30000); // Actualizar cada 30 segundos

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="dashboard">
      {/* Header */}
      <header className="dashboard-header">
        <div className="header-content">
          <div className="logo">
            <i className="fas fa-dice"></i>
            <span>Bingo Digital</span>
          </div>
          <div className="user-info">
            <div className="credit-display">
              <i className="fas fa-coins"></i>
              <span>{userData?.credits || 0} créditos</span>
            </div>
            <div className="user-welcome">
              Hola, <strong>{userData?.username}</strong>
            </div>
            <button onClick={onLogout} className="btn btn-primary">
              <i className="fas fa-sign-out-alt"></i> Salir
            </button>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="dashboard-nav">
        <button 
          className={activeTab === 'games' ? 'nav-btn active' : 'nav-btn'}
          onClick={() => setActiveTab('games')}
        >
          <i className="fas fa-gamepad"></i>
          Juegos Disponibles
        </button>
        <button 
          className={activeTab === 'cards' ? 'nav-btn active' : 'nav-btn'}
          onClick={() => setActiveTab('cards')}
        >
          <i className="fas fa-ticket-alt"></i>
          Mis Cartones
        </button>
        <button 
          className={activeTab === 'history' ? 'nav-btn active' : 'nav-btn'}
          onClick={() => setActiveTab('history')}
        >
          <i className="fas fa-history"></i>
          Historial
        </button>
      </nav>

      {/* Main Content */}
      <main className="dashboard-content">
        {activeTab === 'games' && <GameList user={userData} />}
        {activeTab === 'cards' && <UserCards user={userData} />}
        {activeTab === 'history' && (
          <div className="coming-soon">
            <h2>Historial de Juegos</h2>
            <p>Próximamente...</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;