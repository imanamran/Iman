  // Model

class ModelPuzzle {
  constructor(dimensionArray, controller) {
    this.puzzle = new ModelDefinePuzzle(dimensionArray);
    this.controller = controller;
  }

  // Click on a cell at the given row and col
  clickCell(row, col) {
    const cell = this.puzzle.board[row][col];
    cell.toggleClickState();
  }

  // Try to insert a number into a cell
  insertNumber(row, col, newValue) {
    const cell = this.puzzle.getCell(row, col);
    if (cell && cell.canInsertNumber(newValue, this.puzzle.board)) { // Pass the 'board' as an argument to the 'canInsertNumber' method
      cell.value = newValue;
      return true;
    }
    return false;
  }

  // Get the current state of the puzzle as a 2D array
  getPuzzleState() {
    const state = [];
    for (const row of this.puzzle.board) {
      const stateRow = [];
      for (const cell of row) {
        stateRow.push(cell.value);
      }
      state.push(stateRow);
    }
    return state;
  }

  // Update array
  updateBoard(row,col,newValue,type) {
    // Update the board
    if(type === "marker"){
      this.puzzle.board[row][col].value = newValue;
    // console.log(this.puzzle.board[row][col]);
    }else if (type === "note") {
      if (!this.puzzle.board[row][col].note.includes(newValue)) {
        this.puzzle.board[row][col].note.push(newValue);
      }
    }else if(type === "eraser"){
      this.puzzle.board[row][col].value = newValue;
      this.puzzle.board[row][col].note = [];
    }
  }

  downloadTextFile(filename, content) {
    // Create a Blob from the content string
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  
    // Create an anchor element with a download attribute
    const link = document.createElement('a');
    link.download = filename;
    link.href = URL.createObjectURL(blob);
    link.style.display = 'none';
  
    // Add the link to the DOM, click it, and remove it
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  sendPuzzleToServer() {
    const puzzleChecked = new ModelPuzzleSubmission(this.puzzle);
  
    fetch('process_puzzle.php', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: 'content=' + encodeURIComponent(JSON.stringify(puzzleChecked.checkedBoard))
    })
      .then(response => response.json()) // Change this line to parse the response as JSON
      .then(responseData => {
        // Replace the puzzle.board with the responseData
        // console.log(this.puzzle);
        this.puzzle.updateBoard(responseData);
        console.log(this.puzzle.board);

  
        // Handle the response from PHP
        // console.log(responseData);
        // console.log(this.puzzle.board);
        this.controller.updateCheckedBoard();
      })
      .catch(error => {
        // Handle errors
        console.error('Error:', error);
      });

      
  }
  
  
  
}

class ModelDefinePuzzle {
  constructor(dimensionArray) {
    this.board = this.buildBoard(dimensionArray);
  }

  buildBoard(dimensionArray) {
    const board = [];

    for (let row = 0; row < dimensionArray.length; row++) {
      const boardRow = [];

      for (let col = 0; col < dimensionArray[row].length; col++) {
        const value = dimensionArray[row][col];
        const processedValue = this.processValue(value);
        const cell = new ModelCell(row, col, processedValue);
        boardRow.push(cell);
      }

      board.push(boardRow);
    }
    return board;
  }

  updateBoard(responseData) {
    for (let row = 0; row < responseData.length; row++) {
      for (let col = 0; col < responseData[row].length; col++) {
        const updatedValue = responseData[row][col].value;
        const cell = this.board[row][col];
  
        if (cell) {
          cell.value = updatedValue;
          cell.type = responseData[row][col].type;
          cell.state = responseData[row][col].state;
          cell.answer = responseData[row][col].answer;
        }
      }
    }
  }
  

  processValue(value) {
    if (parseInt(value) >= 1 && parseInt(value) <= 7) {
      return parseInt(value);
    } else {
      return value;
    }
  }

  getCell(row, col) {
    return this.board[row]?.[col];
  }

  getColLength(){
    const colNumber = (this.board.length + 1) / 2;
    return colNumber;
  }
}

class ModelCell {
  constructor(row, col, value) {
    this.row = row;
    this.col = col;
    this.value = value;
    this.note = [];
    this.answer = null;

    this.type = this.determineType();
    this.state = this.determineState();
  }

  determineType() {
    if (this.row % 2 === 0 && this.col % 2 === 0) {
      if (typeof this.value === 'number' && this.value >= 1 && this.value <= 7) {
        return 'hint';
      } else if (this.value === '') {
        return 'blank';
      }
    } else if (['<', '>', 'V', '^'].includes(this.value)) {
      return 'inequality';
    } else {
      return 'unused';
    }
  }

  determineState() {
    if (this.type === 'hint' || this.type === 'inequality' || this.type === 'unused') {
      return 'locked';
    } else {
      return 'unclicked';
    }
  }

  toggleClickState() {
    // If the cell state is 'hint', do nothing and return
    if (this.state === 'locked') {
      return;
    }

    if (this.state === 'clicked') {
      this.state = 'unclicked';
    } else {
      this.state = 'clicked';
    }
  }

  canInsertNumber(newValue, board) {
    const directions = [
      [-1, 0], // Up
      [1, 0], // Down
      [0, -1], // Left
      [0, 1], // Right
    ];
  
    for (const [rowDiff, colDiff] of directions) {
      const newRow = this.row + rowDiff;
      const newCol = this.col + colDiff;
      const neighbor = board[newRow]?.[newCol]; // Access the 'board' parameter instead of the global variable
  
      if (neighbor) {
        if (typeof neighbor.value === 'string') {
          const inequality = neighbor.value;
          if (inequality === '<' && newValue >= this.value) {
            return false;
          }
          if (inequality === '>' && newValue <= this.value) {
            return false;
          }
        } else if (neighbor.value === newValue) {
          return false;
        }
      }
    }
  
    return true;
  }
}




class ModelPuzzleSubmission {
  constructor(puzzleBoard) {
    this.checkedBoard = this.serializeModelDefinePuzzle(puzzleBoard);
  }

  serializeModelDefinePuzzle(modelDefinePuzzle) {
    const serializedBoard = modelDefinePuzzle.board.map(row => row.map(cell => {
      return {
        row: cell.row,
        col: cell.col,
        value: cell.value,
        note: cell.note,
        answer: cell.answer,
        type: cell.type,
        state: cell.state
      };
    }));
  
    return {
      board: serializedBoard
    };
  }

  
}




// Array from the database
// 4 x 4
let dimensionArray = [
  ['2', '', '', '', '', '<', ''],
  ['', '', '', '', '', '', ''],
  ['', '', '3', '', '', '<', ''],
  ['', '', '', '', '', '', '^'],
  ['', '', '', '', '', '', ''],
  ['', '', '', '', 'V', '', ''],
  ['', '', '', '', '', '', '']
];

// 5 x 5
// let dimensionArray = [
// ['1', '>', '', '>', '', '<', '5', '>', ''],
// ['^', '', 'v', '', 'V', '', '^', '', '^'],
// ['', '', '', '<', '', '', '1', 'v', ''],
// ['V', '', '^', '', '^', '', 'v', '', '^'],
// ['', '', '4', '<', '', '>', '', '>', '1'],
// ['V', '', '', '', 'v', '', 'v', '', ''],
// ['', '<', '', '>', '', 'v', '', '>', ''],
// ['^', '', 'v', '', '^', '', 'V', '', '^'],
// ['5', '>', '', 'v', '4', '<', '', 'v', '']
// ];

// 4 x 4 Answer
const dimensionArrayAnswer = [
  ['2', '', '1', '', '3', '<', '4'],
  ['', '', '', '', '', '', ''],
  ['4', '', '3', '', '1', '<', '2'],
  ['', '', '', '', '', '', '^'],
  ['1', '', '2', '', '4', '', '3'],
  ['', '', '', '', 'V', '', ''],
  ['3', '', '4', '', '2', '', '1'],
];

// 6 x 6
// const dimensionArray = [
// ['', '', '', '>', '', '', '', '<', '6', '<', ''],
// ['^', '', '^', '', '^', '', 'v', '', '', '', ''],
// ['', '>', '', '<', '', '>', '', '', '', '<', '2'],
// ['V', '', 'v', '', '^', '', '^', '', 'V', '', '^'],
// ['', '<', '', '>', '5', '', '', 'v', '1', '>', '1'],
// ['^', '', '', '', 'V', '', '^', '', '^', '', '^'],
// ['6', '<', '', '<', '', 'v', '', '>', '', 'v', ''],
// ['', '', '^', '', '^', '', '', '', '^', '', '^'],
// ['6', '>', '', '', '2', '<', '', '>', '2', '', ''],
// ['V', '', 'v', '', '', '', '^', '', 'v', '', 'V'],
// ['', '>', '', '<', '', '<', '', '>', '4', '>', '']
// ];

// 7 x 7
// const dimensionArray = [
//   ['2', '>', '', '<', '', 'v', '', '', '5', 'v', '4', '', ''],
//   ['^', '', '^', '', '^', '', '^', '', '', '', 'V', '', 'v'],
//   ['6', '>', '', '', '1', '', '', 'v', '', '>', '7', '', ''],
//   ['V', '', '^', '', '', '', '', '', '^', '', 'V', '', '^'],
//   ['7', 'v', '5', '', '', 'v', '', '<', '4', '', '7', 'v', ''],
//   ['V', '', '', '', '^', '', '', '', '', '', '', '', '^'],
//   ['', '', '', '>', '3', '', '1', 'v', '5', '<', '', 'v', ''],
//   ['^', '', '^', '', '', '', 'V', '', 'v', '', '', '', ''],
//   ['', '>', '', 'v', '', '', '', '>', '', '<', '', '', ''],
//   ['^', '', 'v', '', '^', '', '', '', '', '', '^', '', 'V'],
//   ['', '<', '3', 'v', '', '>', '', '', '', '>', '', '', ''],
//   ['', '', '^', '', '^', '', 'V', '', '', '', '', '', ''],
//   ['', '<', '', '<', '1', '>', '', '>', '', '', '1', '<', '3']
// ];