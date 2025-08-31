const { Pool } = require('pg');

const pool = new Pool({
  user: 'bingo_user',
  host: 'localhost',
  database: 'bingo_digital',
  password: 'bingo123',
  port: 5432,
});

// Probar la conexión
pool.connect((err, client, release) => {
  if (err) {
    console.error('❌ Error conectando a la base de datos:', err);
  } else {
    console.log('✅ Conectado a PostgreSQL correctamente');
    release();
  }
});

module.exports = pool;