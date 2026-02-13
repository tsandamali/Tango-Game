function generateRound1Puzzle() {
  const size = 4;
  const solution = generateValidTangoSolution(size);
  const givensCount = Math.floor(size * size * 0.25);
  const puzzle = createPuzzleFromSolution(solution, givensCount, size);
  const constraints = generateConstraints(solution, size);

  return {
    type: 'tango',
    size,
    solution,
    puzzle,
    givens: puzzle,
    constraints
  };
}

function generateRound2Puzzle() {
  const size = 6;
  const solution = generateValidTangoSolution(size);
  const givensCount = Math.floor(size * size * 0.25);
  const puzzle = createPuzzleFromSolution(solution, givensCount, size);
  const constraints = generateConstraints(solution, size);

  return {
    type: 'tango',
    size,
    solution,
    puzzle,
    givens: puzzle,
    constraints
  };
}

function generateRound3Puzzle() {
  const size = 8;
  const solution = generateValidTangoSolution(size);
  const givensCount = Math.floor(size * size * 0.25);
  const puzzle = createPuzzleFromSolution(solution, givensCount, size);
  const constraints = generateConstraints(solution, size);

  return {
    type: 'tango',
    size,
    solution,
    puzzle,
    givens: puzzle,
    constraints
  };
}

// Generate a valid Tango solution
function generateValidTangoSolution(size) {
  const grid = Array(size).fill(null).map(() => Array(size).fill(0));
  const half = size / 2;

  function isValid(row, col, value) {
    grid[row][col] = value;

    // Count row
    const rowCount = grid[row].filter(v => v === value).length;
    if (rowCount > half) {
      grid[row][col] = 0;
      return false;
    }

    // Count column
    let colCount = 0;
    for (let r = 0; r < size; r++) {
      if (grid[r][col] === value) colCount++;
    }
    if (colCount > half) {
      grid[row][col] = 0;
      return false;
    }

    // Check no 3 in a row (horizontal)
    for (let c = 0; c < size - 2; c++) {
      if (
          grid[row][c] !== 0 &&
          grid[row][c] === grid[row][c + 1] &&
          grid[row][c] === grid[row][c + 2]
      ) {
        grid[row][col] = 0;
        return false;
      }
    }

    // Check no 3 in a column
    for (let r = 0; r < size - 2; r++) {
      if (
          grid[r][col] !== 0 &&
          grid[r][col] === grid[r + 1][col] &&
          grid[r][col] === grid[r + 2][col]
      ) {
        grid[row][col] = 0;
        return false;
      }
    }

    grid[row][col] = 0;
    return true;
  }

  function solve(row = 0, col = 0) {
    if (row === size) return true;

    const nextRow = col === size - 1 ? row + 1 : row;
    const nextCol = col === size - 1 ? 0 : col + 1;

    const values = Math.random() < 0.5 ? [1, 2] : [2, 1];

    for (let value of values) {
      if (isValid(row, col, value)) {
        grid[row][col] = value;

        if (solve(nextRow, nextCol)) return true;

        grid[row][col] = 0; // backtrack
      }
    }

    return false;
  }

  solve();
  return grid;
}

// Check if placement would violate "no three in a row" rule
function wouldViolateRules(grid, row, col, symbol, size) {
  // Check horizontal
  if (col >= 2 && grid[row][col-1] === symbol && grid[row][col-2] === symbol) {
    return true;
  }
  if (col >= 1 && col < size - 1 && grid[row][col-1] === symbol && grid[row][col+1] === symbol) {
    return true;
  }

  // Check vertical
  if (row >= 2 && grid[row-1][col] === symbol && grid[row-2][col] === symbol) {
    return true;
  }
  if (row >= 1 && row < size - 1 && grid[row-1][col] === symbol && grid[row+1][col] === symbol) {
    return true;
  }

  return false;
}

// Create puzzle from solution by removing some cells
function createPuzzleFromSolution(solution, givensCount, size) {
  const puzzle = solution.map(row => [...row]);

  // Randomly select cells to keep as givens
  const positions = [];
  for (let i = 0; i < size; i++) {
    for (let j = 0; j < size; j++) {
      positions.push([i, j]);
    }
  }

  // Shuffle positions
  positions.sort(() => Math.random() - 0.5);

  // Remove all except givens
  for (let i = givensCount; i < positions.length; i++) {
    const [row, col] = positions[i];
    puzzle[row][col] = 0; // 0 = empty
  }

  return puzzle;
}

// Generate constraints (= and × symbols between cells)
function generateConstraints(solution, size) {
  const constraints = {
    horizontal: [], // Between horizontally adjacent cells
    vertical: []    // Between vertically adjacent cells
  };

  const numConstraints = Math.floor(size * 1.5); // Add some constraints

  // Horizontal constraints
  for (let i = 0; i < numConstraints && i < size * (size - 1); i++) {
    const row = Math.floor(Math.random() * size);
    const col = Math.floor(Math.random() * (size - 1));

    const leftValue = solution[row][col];
    const rightValue = solution[row][col + 1];

    if (leftValue !== 0 && rightValue !== 0) {
      constraints.horizontal.push({
        row,
        col, // Position of the constraint (between col and col+1)
        type: leftValue === rightValue ? 'equal' : 'different' // = or ×
      });
    }
  }

  // Vertical constraints
  for (let i = 0; i < numConstraints && i < (size - 1) * size; i++) {
    const row = Math.floor(Math.random() * (size - 1));
    const col = Math.floor(Math.random() * size);

    const topValue = solution[row][col];
    const bottomValue = solution[row + 1][col];

    if (topValue !== 0 && bottomValue !== 0) {
      constraints.vertical.push({
        row, // Position of the constraint (between row and row+1)
        col,
        type: topValue === bottomValue ? 'equal' : 'different'
      });
    }
  }

  return constraints;
}

function generatePuzzle(round) {
  if (round === 1) return generateRound1Puzzle();
  if (round === 2) return generateRound2Puzzle();
  if (round === 3) return generateRound3Puzzle();
  return generateRound1Puzzle();
}

module.exports = {
  generatePuzzle,
  generateRound1Puzzle,
  generateRound2Puzzle,
  generateRound3Puzzle
};
