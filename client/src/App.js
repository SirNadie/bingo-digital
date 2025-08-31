import React, { useState, useEffect } from 'react';
import './styles/App.css';
import BingoBoard from './BingoBoard';
import NumberDisplay from './NumberDisplay';
import WinnerModal from './WinnerModal';
import AdminPanel from './components/AdminPanel';
import LoginForm from './components/LoginForm';

function App() {
  const [numbers, setNumbers] = useState([]);
  const [currentNumber, setCurrentNumber] = useState(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [winner, setWinner] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [loginError, setLoginError] = useState('');

  // Función de login integrada
  const handleLogin = (username, password) => {
    if (username === 'admin' && password === 'admin123') {
      setIsAdmin(true);
      setShowLogin(false);
      setLoginError('');
      return true;
    } else {
      setLoginError('Usuario o contraseña incorrectos');
      return false;
    }
  };

  const handleLogout = () => {
    setIsAdmin(false);
  };

  const drawNumber = () => {
    if (numbers.length >= 75) return;
    
    let newNumber;
    do {
      newNumber = Math.floor(Math.random() * 75) + 1;
    } while (numbers.includes(newNumber));
    
    setNumbers(prev => [...prev, newNumber]);
    setCurrentNumber(newNumber);
  };

  const resetGame = () => {
    setNumbers([]);
    setCurrentNumber(null);
    setGameStarted(false);
    setWinner(false);
  };

  const checkWinner = (markedNumbers) => {
    // Lógica de verificación de ganador
    const lines = [
      [0, 1, 2, 3, 4], [5, 6, 7, 8, 9], [10, 11, 12, 13, 14],
      [15, 16, 17, 18, 19], [20, 21, 22, 23, 24], // Horizontal
      [0, 5, 10, 15, 20], [1, 6, 11, 16, 21], [2, 7, 12, 17, 22],
      [3, 8, 13, 18, 23], [4, 9, 14, 19, 24], // Vertical
      [0, 6, 12, 18, 24], [4, 8, 12, 16, 20] // Diagonales
    ];

    return lines.some(line => line.every(index => markedNumbers.includes(index)));
  };

  return (
    <div className="App">
      <header className="app-header">
        <h1>🎯 Bingo Digital</h1>
        <div className="header-controls">
          {!isAdmin ? (
            <button 
              className="admin-login-btn"
              onClick={() => setShowLogin(true)}
            >
              🔐 Admin
            </button>
          ) : (
            <button 
              className="logout-btn"
              onClick={handleLogout}
            >
              👋 Cerrar Sesión
            </button>
          )}
        </div>
      </header>

      {showLogin && (
        <LoginForm 
          onLogin={handleLogin}
          onClose={() => setShowLogin(false)}
          error={loginError}
        />
      )}

      {isAdmin && (
        <AdminPanel 
          onDrawNumber={drawNumber}
          onResetGame={resetGame}
          currentNumber={currentNumber}
          numbers={numbers}
          gameStarted={gameStarted}
          onStartGame={() => setGameStarted(true)}
        />
      )}

      <div className="game-container">
        <NumberDisplay currentNumber={currentNumber} />
        
        <BingoBoard 
          numbers={numbers}
          onWinner={() => setWinner(true)}
          checkWinner={checkWinner}
        />
        
        {winner && (
          <WinnerModal 
            onClose={() => setWinner(false)}
            onNewGame={resetGame}
          />
        )}
      </div>
    </div>
  );
}

export default App;