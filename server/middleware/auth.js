const jwt = require('jsonwebtoken');

const JWT_SECRET = 'tu_clave_secreta_bingo';

const authenticateToken = (req, res, next) => {
  console.log('Headers recibidos:', req.headers);
  
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  console.log('Token recibido:', token ? 'Sí' : 'No');

  if (!token) {
    console.log('Token no proporcionado');
    return res.status(401).json({ error: 'Token de acceso requerido' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      console.log('Token inválido:', err.message);
      return res.status(403).json({ error: 'Token inválido' });
    }
    
    console.log('Usuario autenticado:', user);
    req.user = user;
    next();
  });
};

module.exports = authenticateToken;