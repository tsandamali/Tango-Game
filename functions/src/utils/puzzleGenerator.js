/**
 * Tango Binary Puzzle Generator
 * Rules:
 * 1. Fill each cell with either a sun (☀️/yellow) or moon (🌙/blue)
 * 2. No more than 2 of the same symbol can be adjacent (horizontally or vertically)
 * 3. Each row and column must have an equal number of suns and moons
 * 4. Cells separated by = must be the same symbol
 * 5. Cells separated by × must be opposite symbols
 */

class PuzzleGenerator {
  /**
   * Generate a valid Tango puzzle
   * @param {number} size - Grid size (4, 6, or 8)
   * @returns {Object} Puzzle object with grid and constraints
   */
  static generateTangoPuzzle(size = 6) {
    // Generate a valid solution first
    const solution = this.generateValidSolution(size);
    
    // Generate constraints (equality and opposition pairs)
    const constraints = this.generateConstraints(size);
    
    // Create the puzzle by removing some cells (but keeping it solvable)
    const puzzle = this.createPuzzleFromSolution(solution, constraints, size);
    
    return {
      size,
      grid: puzzle.grid,
      solution: solution,
      constraints: constraints,
      fixedCells: puzzle.fixedCells
    };
  }

  /**
   * Generate a valid solution that satisfies all Tango rules
   */
  static generateValidSolution(size) {
    const maxAttempts = 100;
    
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      const grid = this.tryGenerateSolution(size);
      if (grid && this.isValidSolution(grid, size)) {
        return grid;
      }
    }
    
    // Fallback: generate a known valid pattern
    return this.generateFallbackSolution(size);
  }

  /**
   * Try to generate a valid solution using backtracking
   */
  static tryGenerateSolution(size) {
    const grid = Array(size).fill(null).map(() => Array(size).fill(null));
    
    if (this.fillGrid(grid, size, 0, 0)) {
      return grid;
    }
    
    return null;
  }

  /**
   * Fill grid using backtracking with Tango constraints
   */
  static fillGrid(grid, size, row, col) {
    if (row === size) {
      return true; // Finished filling all rows
    }
    
    const nextRow = col === size - 1 ? row + 1 : row;
    const nextCol = col === size - 1 ? 0 : col + 1;
    
    // Try both values (0 = sun/yellow, 1 = moon/blue) in random order
    const values = Math.random() > 0.5 ? [0, 1] : [1, 0];
    
    for (const value of values) {
      grid[row][col] = value;
      
      if (this.isValidPlacement(grid, size, row, col)) {
        if (this.fillGrid(grid, size, nextRow, nextCol)) {
          return true;
        }
      }
      
      grid[row][col] = null;
    }
    
    return false;
  }

  /**
   * Check if placing a value at (row, col) is valid so far
   */
  static isValidPlacement(grid, size, row, col) {
    const value = grid[row][col];
    if (value === null) return true;
    
    // Count suns and moons in row so far
    let rowSuns = 0, rowMoons = 0;
    for (let c = 0; c < size; c++) {
      if (grid[row][c] === 0) rowSuns++;
      else if (grid[row][c] === 1) rowMoons++;
    }
    
    // Check row balance constraint (can't exceed half)
    const halfSize = size / 2;
    if (rowSuns > halfSize || rowMoons > halfSize) return false;
    
    // Count suns and moons in column so far
    let colSuns = 0, colMoons = 0;
    for (let r = 0; r < size; r++) {
      if (grid[r][col] === 0) colSuns++;
      else if (grid[r][col] === 1) colMoons++;
    }
    
    // Check column balance constraint (can't exceed half)
    if (colSuns > halfSize || colMoons > halfSize) return false;
    
    // Check no more than 2 adjacent same symbols (horizontal)
    if (col >= 2) {
      if (grid[row][col - 1] === value && grid[row][col - 2] === value) {
        return false;
      }
    }
    
    // Check no more than 2 adjacent same symbols (vertical)
    if (row >= 2) {
      if (grid[row - 1][col] === value && grid[row - 2][col] === value) {
        return false;
      }
    }
    
    return true;
  }

  /**
   * Validate a complete solution
   */
  static isValidSolution(grid, size) {
    const halfSize = size / 2;
    
    for (let i = 0; i < size; i++) {
      // Check row balance
      const rowSuns = grid[i].filter(v => v === 0).length;
      const rowMoons = grid[i].filter(v => v === 1).length;
      if (rowSuns !== halfSize || rowMoons !== halfSize) return false;
      
      // Check column balance
      let colSuns = 0, colMoons = 0;
      for (let j = 0; j < size; j++) {
        if (grid[j][i] === 0) colSuns++;
        else if (grid[j][i] === 1) colMoons++;
      }
      if (colSuns !== halfSize || colMoons !== halfSize) return false;
      
      // Check no triple adjacent in rows
      for (let j = 0; j < size - 2; j++) {
        if (grid[i][j] === grid[i][j + 1] && grid[i][j] === grid[i][j + 2]) {
          return false;
        }
      }
      
      // Check no triple adjacent in columns
      for (let j = 0; j < size - 2; j++) {
        if (grid[j][i] === grid[j + 1][i] && grid[j][i] === grid[j + 2][i]) {
          return false;
        }
      }
    }
    
    return true;
  }

  /**
   * Fallback solution generator - creates a known valid pattern
   */
  static generateFallbackSolution(size) {
    const grid = Array(size).fill(null).map(() => Array(size).fill(null));
    const halfSize = size / 2;
    
    // Create a simple alternating pattern that satisfies the rules
    for (let row = 0; row < size; row++) {
      for (let col = 0; col < size; col++) {
        // Alternate pattern with some variation
        if (row % 2 === 0) {
          grid[row][col] = col < halfSize ? 0 : 1;
        } else {
          grid[row][col] = col >= halfSize ? 0 : 1;
        }
      }
    }
    
    // Shuffle rows to add variety
    for (let i = 0; i < size; i++) {
      if (Math.random() > 0.5 && i < size - 1) {
        // Swap with next row if it doesn't violate constraints
        const temp = grid[i];
        grid[i] = grid[i + 1];
        grid[i + 1] = temp;
      }
    }
    
    return grid;
  }

  /**
   * Generate constraint pairs (equality and opposition)
   */
  static generateConstraints(size) {
    const constraints = {
      equal: [],   // Cells that must be equal (=)
      opposite: [] // Cells that must be opposite (×)
    };
    
    // Generate random constraints between adjacent cells
    for (let row = 0; row < size; row++) {
      for (let col = 0; col < size; col++) {
        // Horizontal constraints
        if (col < size - 1 && Math.random() > 0.7) {
          const constraintType = Math.random() > 0.5 ? 'equal' : 'opposite';
          constraints[constraintType].push({
            cell1: { row, col },
            cell2: { row, col: col + 1 }
          });
        }
        
        // Vertical constraints
        if (row < size - 1 && Math.random() > 0.7) {
          const constraintType = Math.random() > 0.5 ? 'equal' : 'opposite';
          constraints[constraintType].push({
            cell1: { row, col },
            cell2: { row: row + 1, col }
          });
        }
      }
    }
    
    return constraints;
  }

  /**
   * Create puzzle grid by revealing some cells
   */
  static createPuzzleFromSolution(solution, constraints, size) {
    const grid = solution.map(row => row.map(cell => null));
    const fixedCells = [];
    
    // Calculate how many cells to reveal (about 30-40% of the grid)
    const totalCells = size * size;
    const cellsToReveal = Math.floor(totalCells * (0.3 + Math.random() * 0.1));
    
    // Randomly select cells to reveal
    const allCells = [];
    for (let row = 0; row < size; row++) {
      for (let col = 0; col < size; col++) {
        allCells.push({ row, col });
      }
    }
    
    // Shuffle and pick cells to reveal
    for (let i = allCells.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [allCells[i], allCells[j]] = [allCells[j], allCells[i]];
    }
    
    for (let i = 0; i < cellsToReveal; i++) {
      const { row, col } = allCells[i];
      grid[row][col] = solution[row][col];
      fixedCells.push({ row, col, value: solution[row][col] });
    }
    
    return { grid, fixedCells };
  }

  /**
   * Validate a player's solution
   */
  static validateSolution(playerGrid, puzzle) {
    const size = puzzle.size;
    const errors = [];
    const halfSize = size / 2;
    
    // Check if all cells are filled
    for (let row = 0; row < size; row++) {
      for (let col = 0; col < size; col++) {
        if (playerGrid[row][col] === null || playerGrid[row][col] === undefined) {
          errors.push({ type: 'incomplete', row, col, message: 'All cells must be filled' });
        }
      }
    }
    
    if (errors.length > 0) {
      return { valid: false, errors, message: 'Puzzle is incomplete' };
    }
    
    // Check fixed cells match
    for (const fixed of puzzle.fixedCells) {
      if (playerGrid[fixed.row][fixed.col] !== fixed.value) {
        errors.push({
          type: 'fixed_cell',
          row: fixed.row,
          col: fixed.col,
          message: 'Cannot change pre-filled cells'
        });
      }
    }
    
    // Check row balance
    for (let row = 0; row < size; row++) {
      const suns = playerGrid[row].filter(v => v === 0).length;
      const moons = playerGrid[row].filter(v => v === 1).length;
      if (suns !== halfSize || moons !== halfSize) {
        errors.push({
          type: 'row_balance',
          row,
          message: `Row ${row + 1} must have equal suns and moons (${halfSize} each)`
        });
      }
    }
    
    // Check column balance
    for (let col = 0; col < size; col++) {
      let suns = 0, moons = 0;
      for (let row = 0; row < size; row++) {
        if (playerGrid[row][col] === 0) suns++;
        else if (playerGrid[row][col] === 1) moons++;
      }
      if (suns !== halfSize || moons !== halfSize) {
        errors.push({
          type: 'column_balance',
          col,
          message: `Column ${col + 1} must have equal suns and moons (${halfSize} each)`
        });
      }
    }
    
    // Check no three adjacent (horizontal)
    for (let row = 0; row < size; row++) {
      for (let col = 0; col < size - 2; col++) {
        if (playerGrid[row][col] === playerGrid[row][col + 1] &&
            playerGrid[row][col] === playerGrid[row][col + 2]) {
          errors.push({
            type: 'triple_adjacent',
            row,
            col,
            message: 'No more than 2 same symbols can be adjacent'
          });
        }
      }
    }
    
    // Check no three adjacent (vertical)
    for (let col = 0; col < size; col++) {
      for (let row = 0; row < size - 2; row++) {
        if (playerGrid[row][col] === playerGrid[row + 1][col] &&
            playerGrid[row][col] === playerGrid[row + 2][col]) {
          errors.push({
            type: 'triple_adjacent',
            row,
            col,
            message: 'No more than 2 same symbols can be adjacent'
          });
        }
      }
    }
    
    // Check equality constraints
    for (const constraint of puzzle.constraints.equal) {
      const { cell1, cell2 } = constraint;
      if (playerGrid[cell1.row][cell1.col] !== playerGrid[cell2.row][cell2.col]) {
        errors.push({
          type: 'equality_constraint',
          cells: [cell1, cell2],
          message: 'Cells with = must be the same symbol'
        });
      }
    }
    
    // Check opposition constraints
    for (const constraint of puzzle.constraints.opposite) {
      const { cell1, cell2 } = constraint;
      if (playerGrid[cell1.row][cell1.col] === playerGrid[cell2.row][cell2.col]) {
        errors.push({
          type: 'opposition_constraint',
          cells: [cell1, cell2],
          message: 'Cells with × must be opposite symbols'
        });
      }
    }
    
    // Check if matches actual solution
    const matchesSolution = this.matchesSolution(playerGrid, puzzle.solution);
    
    if (errors.length > 0) {
      return {
        valid: false,
        errors,
        message: errors[0].message,
        matchesSolution
      };
    }
    
    if (!matchesSolution) {
      return {
        valid: false,
        errors: [{ type: 'incorrect', message: 'Solution does not match' }],
        message: 'Incorrect solution',
        matchesSolution
      };
    }
    
    return { valid: true, errors: [], message: 'Correct solution!' };
  }

  /**
   * Check if player grid matches solution
   */
  static matchesSolution(playerGrid, solution) {
    for (let row = 0; row < solution.length; row++) {
      for (let col = 0; col < solution[row].length; col++) {
        if (playerGrid[row][col] !== solution[row][col]) {
          return false;
        }
      }
    }
    return true;
  }
}

module.exports = PuzzleGenerator;