const pool = require('./config/database');
const bcrypt = require('bcryptjs');

async function testCompleteGameFlow() {
  console.log('🎯 INICIANDO PRUEBA COMPLETA DE BINGO (Sin WebSockets)\n');

  try {
    // 1. Crear usuario de prueba
    console.log('1. 🧪 Creando usuario de prueba...');
    const hashedPassword = await bcrypt.hash('password123', 10);
    const userResult = await pool.query(
      'INSERT INTO users (username, email, password, credits, is_admin) VALUES ($1, $2, $3, $4, $5) RETURNING id, username',
      ['test_player', 'test@example.com', hashedPassword, 100, false]
    );
    const testUser = userResult.rows[0];
    console.log('✅ Usuario creado:', testUser.username, '(ID:', testUser.id + ')');

    // 2. Crear juego de prueba
    console.log('\n2. 🎮 Creando juego de prueba...');
    const gameResult = await pool.query(
      'INSERT INTO games (name, prize, status) VALUES ($1, $2, $3) RETURNING id, name, prize',
      ['Bingo de Prueba', 500, 'pending']
    );
    const testGame = gameResult.rows[0];
    console.log('✅ Juego creado:', testGame.name, '(Premio:', testGame.prize + ' créditos)');

    // 3. Crear cartón de prueba con números predefinidos para GANAR
    console.log('\n3. 🃏 Creando cartón de prueba (con patrón ganador)...');
    const winningNumbers = [
      [1, 16, 31, 46, 61],    // B: 1, 16, 31, 46, 61
      [2, 17, 32, 47, 62],    // I: 2, 17, 32, 47, 62  
      [3, 0, 33, 48, 63],     // N: 3, FREE, 33, 48, 63
      [4, 19, 34, 49, 64],    // G: 4, 19, 34, 49, 64
      [5, 20, 35, 50, 65]     // O: 5, 20, 35, 50, 65
    ];
    
    const cardResult = await pool.query(
      'INSERT INTO bingo_cards (user_id, game_id, numbers, price) VALUES ($1, $2, $3, $4) RETURNING id',
      [testUser.id, testGame.id, winningNumbers, 1]
    );
    const cardId = cardResult.rows[0].id;
    console.log('✅ Cartón creado (ID:', cardId + ') con patrón ganador');

    // 4. Descontar créditos por compra de cartón
    console.log('\n4. 💳 Descontando créditos por compra...');
    await pool.query(
      'UPDATE users SET credits = credits - 1 WHERE id = $1',
      [testUser.id]
    );
    
    const afterPurchase = await pool.query('SELECT credits FROM users WHERE id = $1', [testUser.id]);
    console.log('✅ Créditos después de compra:', afterPurchase.rows[0].credits);

    // 5. Simular inicio de juego
    console.log('\n5. ⚡ Iniciando juego...');
    await pool.query(
      'UPDATE games SET status = $1, start_time = NOW() WHERE id = $2',
      ['active', testGame.id]
    );
    console.log('✅ Juego iniciado');

    // 6. Simular sorteo de números (los necesarios para el patrón ganador)
    console.log('\n6. 🎲 Sorteando números para patrón ganador...');
    const numbersToDraw = [1, 16, 31, 46, 61, 2, 17, 32, 47, 62, 3, 33, 48, 63, 4, 19, 34, 49, 64, 5, 20, 35, 50, 65];
    
    for (const number of numbersToDraw) {
      await pool.query(
        'UPDATE games SET drawn_numbers = array_append(drawn_numbers, $1) WHERE id = $2',
        [number, testGame.id]
      );
      console.log('   Sorteado:', number);
    }

    // 7. Verificar que el cartón tiene BINGO
    console.log('\n7. 🔍 Verificando patrón de BINGO...');
    
    // Función de verificación
    function checkBingo(cardNumbers, drawnNumbers) {
      const flatCard = cardNumbers.flat();
      const patterns = [
        // Líneas horizontales
        [0, 1, 2, 3, 4], [5, 6, 7, 8, 9], [10, 11, 12, 13, 14],
        [15, 16, 17, 18, 19], [20, 21, 22, 23, 24],
        // Líneas verticales  
        [0, 5, 10, 15, 20], [1, 6, 11, 16, 21], [2, 7, 12, 17, 22],
        [3, 8, 13, 18, 23], [4, 9, 14, 19, 24],
        // Diagonales
        [0, 6, 12, 18, 24], [4, 8, 12, 16, 20]
      ];

      return patterns.some(pattern => 
        pattern.every(index => {
          const number = flatCard[index];
          return number === 0 || drawnNumbers.includes(number);
        })
      );
    }

    // Obtener números sorteados
    const gameStateResult = await pool.query(
      'SELECT drawn_numbers FROM games WHERE id = $1',
      [testGame.id]
    );
    const drawnNumbers = gameStateResult.rows[0].drawn_numbers;

    const hasBingo = checkBingo(winningNumbers, drawnNumbers);
    console.log('✅ El cartón', hasBingo ? 'TIENE BINGO! 🎉' : 'NO tiene bingo');

    // 8. Simular validación y premio
    if (hasBingo) {
      console.log('\n8. 🏆 Otorgando premio...');
      
      await Promise.all([
        pool.query('UPDATE bingo_cards SET is_winner = true WHERE id = $1', [cardId]),
        pool.query('UPDATE games SET status = $1, end_time = NOW() WHERE id = $2', ['finished', testGame.id]),
        pool.query('UPDATE users SET credits = credits + $1 WHERE id = $2', [testGame.prize, testUser.id])
      ]);

      // Verificar nuevos créditos
      const userUpdate = await pool.query('SELECT credits FROM users WHERE id = $1', [testUser.id]);
      console.log('✅ Premio otorgado! Nuevos créditos:', userUpdate.rows[0].credits);
    }

    // 9. Mostrar resumen final
    console.log('\n' + '='.repeat(60));
    console.log('🎊 PRUEBA COMPLETADA EXITOSAMENTE!');
    console.log('='.repeat(60));
    console.log('👤 Usuario:', testUser.username);
    console.log('🎯 Juego:', testGame.name);
    console.log('💰 Premio:', testGame.prize, 'créditos');
    console.log('🃏 Cartón:', hasBingo ? 'GANADOR 🏆' : 'No ganador');
    console.log('🔢 Números sorteados:', drawnNumbers.length);
    console.log('💳 Créditos finales:', userUpdate?.rows[0]?.credits || afterPurchase.rows[0].credits);
    console.log('='.repeat(60));

  } catch (error) {
    console.error('❌ Error en la prueba:', error);
  } finally {
    // Limpiar datos de prueba
    console.log('\n🧹 Limpiando datos de prueba...');
    try {
      await pool.query('DELETE FROM bingo_cards WHERE user_id IN (SELECT id FROM users WHERE username = $1)', ['test_player']);
      await pool.query('DELETE FROM games WHERE name = $1', ['Bingo de Prueba']);
      await pool.query('DELETE FROM users WHERE username = $1', ['test_player']);
      console.log('✅ Datos de prueba eliminados');
    } catch (cleanupError) {
      console.log('⚠️ Error limpiando datos:', cleanupError.message);
    }
    
    process.exit();
  }
}

// Ejecutar prueba
testCompleteGameFlow();