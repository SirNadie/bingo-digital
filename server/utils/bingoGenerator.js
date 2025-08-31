class BingoGenerator {
  static generateCard() {
    const card = [];
    const ranges = [
      { min: 1, max: 15 },   // B
      { min: 16, max: 30 },  // I
      { min: 31, max: 45 },  // N
      { min: 46, max: 60 },  // G
      { min: 61, max: 75 }   // O
    ];

    for (let col = 0; col < 5; col++) {
      const column = [];
      const numbers = new Set();
      
      // Generar 5 números únicos para cada columna
      while (numbers.size < 5) {
        const num = Math.floor(Math.random() * (ranges[col].max - ranges[col].min + 1)) + ranges[col].min;
        numbers.add(num);
      }
      
      // Convertir a array y ordenar
      column.push(...Array.from(numbers).sort((a, b) => a - b));
      
      // El centro es FREE (0)
      if (col === 2) {
        column[2] = 0; // FREE space
      }
      
      card.push(column);
    }

    // Transponer la matriz para tener filas en lugar de columnas
    const rows = [];
    for (let i = 0; i < 5; i++) {
      const row = [];
      for (let j = 0; j < 5; j++) {
        row.push(card[j][i]);
      }
      rows.push(row);
    }

    return rows;
  }

  static validateCard(card) {
    // Verificar que es una matriz 5x5
    if (!Array.isArray(card) || card.length !== 5) {
      return false;
    }
    
    for (let i = 0; i < 5; i++) {
      if (!Array.isArray(card[i]) || card[i].length !== 5) {
        return false;
      }
    }
    
    // Verificar que el centro es FREE (0)
    if (card[2][2] !== 0) {
      return false;
    }
    
    return true;
  }

  static generateMultipleCards(count) {
    const cards = [];
    for (let i = 0; i < count; i++) {
      cards.push(this.generateCard());
    }
    return cards;
  }
}

module.exports = BingoGenerator;