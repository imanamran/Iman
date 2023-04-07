// Controller
class ControllerPuzzle {
    constructor() {
      this.model = null;
      this.view = null;
      this.lastClickedRow = null;
      this.lastClickedCol = null;
      this.startX = 0;
      this.note = false;
      this.marker = false;
      this.eraser = false;    
      this.reset = false;
    }

    getStartX() {
        return this.startX;
    }

    setModel(model) {
        this.model = model;
      }
    
    setView(view) {
        this.view = view;
    }
  
    handleClickCell(row, col) {
        const cell = this.model.puzzle.board[row][col];
    
        // Only change state if cell state is not 'correct'
        if (cell.type !== 'correct') {
            cell.state = cell.state === 'unclicked' ? 'clicked' : 'unclicked';
    
            if (cell.state === 'unclicked') {
                this.lastClickedRow = null;
                this.lastClickedCol = null;
            } else {
                this.lastClickedRow = row;
                this.lastClickedCol = col;
            }
        }
    }
    
  
    handleClickInputCell(value, type) {
        if (this.lastClickedRow !== null && this.lastClickedCol !== null) {
            this.updateModelBoard(this.lastClickedRow, this.lastClickedCol, value, type);
            this.displayInput(type);
        } else {
            console.log("Must select a cell first");
        }
    }

    handleStationaryInputCell(inputType, clicked) {
        this.eraser = false;
        this.note = false;
        this.marker = false;
        this.reset = false;

        switch (inputType) {
            case 'eraser':
                this.eraser = clicked;
                // this.handleEraserButton(clicked);
                break;
            case 'note':
                this.note = clicked;
                // this.handleNoteButton(clicked);
                break;
            case 'marker':
                this.marker = clicked;
                break;
            case 'reset':
                this.reset = clicked;
                break;
        }
    }

    deselectAllPuzzleCellOutlines(){
        // this.view.deselectAllPuzzleCells();
        this.view.boardPuzzle.deselectAllPuzzleCellOutlines();
    }

    deselectAllPuzzleCells(){
        this.view.boardPuzzle.deselectAllPuzzleCells();
    }

    resetAllPuzzleCells(){
        this.view.boardPuzzle.resetAllPuzzleCells();
    }
    
  
    // Add a new method to update the dimensionArray
    updateModelBoard(row, col, newValue, type) {
      this.model.updateBoard(row, col, newValue, type);
    //   console.log(this.model.puzzle.board[6][6]);

    }

    displayInput(type) {
        this.view.displayInput(type);
    }

    handleSubmit() {
        // Send the content to PHP using an AJAX POST request
        this.model.sendPuzzleToServer();
        
        // console.log(this.model);
      }

    updateCheckedBoard() {
        this.view.updateCheckedBoard();
        this.view.deselectAllStationaryButtons();
    }    
      
}


