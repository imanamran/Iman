function createEmptyPuzzleBoard(size) {
  const boardSize = size * 2 - 1;
  const board = new Array(boardSize).fill(null).map(() => new Array(boardSize).fill(' '));

  for (let row = 0; row < boardSize; row++) {
    for (let col = 0; col < boardSize; col++) {
      // Set initial values for number cells
      if (row % 2 === 0 && col % 2 === 0) {
        board[row][col] = '0';
      }
      // Set placeholders for inequality constraints
      if ((row % 2 === 0 && col % 2 === 1) || (row % 2 === 1 && col % 2 === 0)) {
        board[row][col] = '-';
      }
    }
  }

  return board;
}

const size = 4;
const board = createEmptyPuzzleBoard(size);
console.log(board);



  // OOP + MVC

  // Model

    // Cell
      // Attributes: row, column, value, isGiven
      // Methods:
        // All: setValue, getValue, setGiven, getGiven


    // Constraint
      // Attributes: Greater
    // CellConstraint


  // View 
    // Stationery
    // Puzzle
    // Cell
    // Input


  // Controller

    // Stationery
      // Attributes: name, clicked, image
      // Methods: 
        // All: click, unclick
        // Eraser: erase
        // Note: write possible answers
        // Marker: write answer

        // Objects: Eraser, Note, Marker


    // Puzzle
      // Attributes: 
      // Methods:


  
