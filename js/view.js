// View

class ViewPuzzle {
    constructor(model, scene, controller) {
        this.model = model;
        this.scene = scene;
        this.controller = controller;
        this.boardPuzzle = null;
        this.inputPuzzle = null;
    }

    createPuzzleViews() {
        // Puzzle Board
        this.boardPuzzle = new PuzzleBoard(this.model, this.scene, this.controller);
        this.boardPuzzle.createGraphics();

        // Puzzle Input Buttons
        this.inputPuzzle = new PuzzleInput(this.model, this.scene, this.controller, this.boardPuzzle.getBoardHeight());
        this.inputPuzzle.createButtons();

        // Puzzle Stationary Buttons
        this.stationaryPuzzle = new PuzzleStationary(this.model, this.scene, this.controller, 0);
        this.stationaryPuzzle.createButtons();

        // Puzzle Submit Button
        const inputBottomY = this.inputPuzzle.inputOffsetY + this.inputPuzzle.cellSize;
        this.submitPuzzle = new PuzzleSubmit(this.model, this.scene, this.controller, inputBottomY);
        this.submitPuzzle.createSubmitButton();

        // Leaderboard
        // this.leaderboard = new Leaderboard(this.model, this.scene, this.controller, 16, 0);
        // this.leaderboard.createGraphics();
    }
    
    displayInput(type) {
        this.boardPuzzle.displayInput(type);
    }

    deselectAllStationaryButtons() {
        this.stationaryPuzzle.deselectAllStationaryButtons();
    }

    updateCheckedBoard() {
        this.boardPuzzle.currentlyClickedCell = null;
        this.boardPuzzle.createGraphics();
    }
}


// Stationary Buttons
class PuzzleStationary extends ViewPuzzle {
    constructor(model, scene, controller, inputOffsetY) {
        super(model, scene, controller);
        
        this.inputOffsetY = inputOffsetY;
        this.cellSize = 40;
        this.cornerRadius = 6;
        this.fillColor = 0xf4f6f8;
        this.clickedFillColor = 0xb8b8b8 ;
        this.outlineColor = 0x000000;
        this.hoverFillColor = 0xd0d0d0;
    }

    drawButton(x, y, imageName) {
        const graphics = this.scene.add.graphics();
    
        graphics.fillStyle(this.fillColor, 1);
        graphics.lineStyle(2, this.outlineColor, 1);
    
        const size = this.cellSize;
        const cornerRadius = this.cornerRadius;
    
        graphics.fillRoundedRect(x, y, size, size, cornerRadius);
        graphics.strokeRoundedRect(x, y, size, size, cornerRadius);
    
        const image = this.scene.add.image(x + size / 2, y + size / 2, imageName).setOrigin(0.5);
        image.setScale(size / image.width, size / image.height); // Scale the image to fit the button
    
        // Add a new property to store the state of the button
        const state = { clicked: false };
        return { graphics, image, state };
    }
    

    changeButtonColor(button, x, y, width, height) {
        // Check if button state exists
        if (button.state) {
            button.state.clicked = !button.state.clicked;
        } else {
            // If button state doesn't exist, create it with the 'clicked' property set to true
            button.state = { clicked: true };
        }
    
        const fillColor = button.state.clicked ? this.clickedFillColor : this.fillColor;
    
        button.graphics.fillStyle(fillColor, 1);
        button.graphics.fillRoundedRect(x, y, width, height, this.cornerRadius);
        button.graphics.strokeRoundedRect(x, y, width, height, this.cornerRadius);
    }
    
    createButtons() {
        const gap = 7;
        const imageNames = ['eraser', 'note', 'marker', 'reset'];
    
        // Add an instance variable to store button states
        this.buttons = [];
    
        // Calculate the starting position for the buttons
        const board = this.model.puzzle.board;
        const numberOfRows = board.length;
        const numberOfCols = board[0].length;
        const totalBoardWidth = numberOfCols * this.cellSize;
        const startX = this.controller.getStartX();
    
        for (let col = 0; col < imageNames.length; col++) {
            const x = startX + col * (this.cellSize + gap) + 2;
            const y = this.inputOffsetY + 2;
            const button = this.drawButton(x, y, imageNames[col]);
    
            const rectangle = new Phaser.Geom.Rectangle(x, y, this.cellSize, this.cellSize);
            const hitArea = this.scene.add.graphics({ fillStyle: { color: 0x0000ff, alpha: 0.0 } });
            hitArea.fillRectShape(rectangle);
            hitArea.setInteractive(rectangle, Phaser.Geom.Rectangle.Contains);

            hitArea.setDepth(-1);
    
            // Store the button and its related properties in an object
            const buttonObj = {
                button: button,
                hitArea: hitArea,
                x: x,
                y: y,
                imageName: imageNames[col],
            };
    
            this.buttons.push(buttonObj);
    
            hitArea.on('pointerdown', () => {
                // Iterate through all buttons and update their state and colors based on the clicked button
                this.buttons.forEach((btn) => {
                    const isSelected = btn.imageName === buttonObj.imageName;
                    const newClickedState = isSelected ? !btn.button.state.clicked : false;
    
                    if (newClickedState !== btn.button.state.clicked) {
                        this.changeButtonColor(btn.button, btn.x, btn.y, this.cellSize, this.cellSize);
                    }
                });
                this.controller.handleStationaryInputCell(imageNames[col], button.state.clicked);

                if(button.state.clicked == false && (imageNames[col] === 'marker' || imageNames[col] === 'note' || imageNames[col] === 'eraser')) {
                    this.controller.deselectAllPuzzleCellOutlines();
                }

                if(button.state.clicked == true && imageNames[col] === 'eraser') {
                    this.controller.deselectAllPuzzleCellOutlines();
                    // TODO: Erase notes or answers when a cell is clicked
                }
                if(button.state.clicked == true && imageNames[col] === 'reset') {
                    this.controller.resetAllPuzzleCells();
                }
                // console.log(button.state.clicked);
            });

            hitArea.on('pointerover', () => {
                if (!buttonObj.button.state.clicked) {
                    this.changeButtonFillColor(buttonObj.button.graphics, this.hoverFillColor, buttonObj.x, buttonObj.y);
                }
            });
    
            hitArea.on('pointerout', () => {
                if (!buttonObj.button.state.clicked) {
                    this.changeButtonFillColor(buttonObj.button.graphics, this.fillColor, buttonObj.x, buttonObj.y);
                }
            });
            
            
            // Pointer up
        }
    }

    deselectAllStationaryButtons() {
        this.buttons.forEach((buttonObj) => {
            if (buttonObj.button.state.clicked) {
                this.changeButtonColor(buttonObj.button, buttonObj.x, buttonObj.y, this.cellSize, this.cellSize);
            }
        });
    }
    // Add this new function to the PuzzleStationary class
    changeButtonFillColor(graphics, newFillColor, x, y) {
        graphics.fillStyle(newFillColor, 1);
        graphics.fillRoundedRect(x, y, this.cellSize, this.cellSize, this.cornerRadius);
        graphics.strokeRoundedRect(x, y, this.cellSize, this.cellSize, this.cornerRadius);
    }  
}

//Board
class PuzzleBoard extends ViewPuzzle {
    constructor(model, scene, controller) {
        super(model, scene, controller);
        this.cellWidth = 50;
        this.cellHeight = 50;
        this.cornerRadius = 8;
        this.startX = 0;
        this.puzzleCells = [];
        this.currentlyClickedCell = null;
        this.backgroundHeight = 0;
    }

    createGraphics() {
        this.drawBackground();
        this.buildPuzzleCells();
    }

    drawBackground() {
        const board = this.model.puzzle.board;
        const numberOfRows = board.length;
        const numberOfCols = board[0].length;
        const totalBoardWidth = numberOfCols * this.cellWidth/1.3;
        const totalBoardHeight = numberOfRows * this.cellHeight/1.3;
    
        const padding = 20; // Adjust the padding value as needed
        const backgroundWidth = totalBoardWidth + padding * 2;
        const backgroundHeight = totalBoardHeight + padding * 2;
    
        // Calculate the starting x position to center the background and board horizontally
        const startX = (this.scene.scale.width - backgroundWidth) / 2;
        const topMargin = 70;
    
        const backgroundX = startX;
        const backgroundY = topMargin - padding;
    
        const backgroundColor = 0xf4f6f8;
        const graphics = this.scene.add.graphics();
        graphics.fillStyle(backgroundColor);
        graphics.fillRoundedRect(backgroundX, backgroundY, backgroundWidth, backgroundHeight, 16);
    
        // Update the startX position for buildPuzzleCells
        this.startX = startX + padding  ;
        this.controller.startX = this.startX - padding;

        this.backgroundHeight = backgroundHeight + 70;
    }

    getStartX() {
        return this.startX;
    }
    

    buildPuzzleCells() {
        const board = this.model.puzzle.board;
    
        const numberOfRows = board.length;
        const numberOfCols = board[0].length;
    
        // Set the top margin
        const topMargin = 70;
    
        for (let row = 0; row < numberOfRows; row++) {
            this.puzzleCells[row] = [];
            for (let col = 0; col < numberOfCols; col++) {
                const cell = board[row][col];
                const x = col * this.cellWidth/1.3 + this.startX -5;
                const y = row * this.cellHeight/1.3 + topMargin -5;
    
                if (cell.type === 'hint' || cell.type === 'blank' || cell.type === 'correct' || cell.type === 'incorrect') {
                    this.puzzleCells[row][col] = new PuzzleCell(
                        this.scene,
                        x,
                        y,
                        this.cellWidth,
                        this.cellHeight,
                        this.cornerRadius,
                        cell,
                        () => this.handleClickCell(row, col),
                        this.controller
                    );
                } else if (cell.type === 'inequality') {
                    new PuzzleConstraint(this.scene, x, y, this.cellWidth, this.cellHeight, cell.value);
                }
            }
        }
    }
    

    handleClickCell(row, col) {
        const cell = this.model.puzzle.board[row][col];


        if (this.currentlyClickedCell) {
            const { row: oldRow, col: oldCol } = this.currentlyClickedCell;

            console.log(oldRow, oldCol);
            this.puzzleCells[oldRow][oldCol].updateCellOutline(this.puzzleCells[oldRow][oldCol].graphics, this.puzzleCells[oldRow][oldCol].blankColors.outline);
            this.puzzleCells[oldRow][oldCol].modelCell.state = 'unclicked';
            
            if (oldRow === row && oldCol === col) {
                this.puzzleCells[row][col].modelCell.state = 'unclicked';
                this.puzzleCells[row][col].updateCellOutline(this.puzzleCells[row][col].graphics, 0x000000);
                this.currentlyClickedCell = null;
                console.log('same cell');
            }
        }

        if (this.controller.marker === true || this.controller.note === true || this.controller.eraser === true) {
            this.controller.handleClickCell(row, col);
            const newOutlineColor = this.puzzleCells[row][col].modelCell.state === 'clicked' ? 0xffbe0b : this.puzzleCells[row][col].blankColors.outline;
            this.puzzleCells[row][col].updateCellOutline(this.puzzleCells[row][col].graphics, newOutlineColor);
            this.currentlyClickedCell = { row, col };
        }

        if (this.controller.reset === false) {
            return;
        }
    }
    

    getBoardHeight() {
        return this.backgroundHeight;
    }

    displayInput(type) {
        const board = this.model.puzzle.board;

        for (let row = 0; row < board.length; row++) {
            for (let col = 0; col < board[row].length; col++) {
                const cell = board[row][col];

                if (cell.type === 'blank') {
                    if(type === 'marker'){
                        // console.log(cell.value);
                        this.puzzleCells[row][col].updateValue();
                    }else if(type === 'note'){
                        this.puzzleCells[row][col].updateNoteValue();
                        // console.log(this,this.puzzleCells[row][col].note);
                        // this.puzzleCells[row][col].updateNoteValue(cell.noteValue);
                    }else if(type === 'eraser'){
                        this.puzzleCells[row][col].updateValue();
                        this.puzzleCells[row][col].updateNoteValue();
                    }
                }
            }
        }
    }

    deselectAllPuzzleCellOutlines() {
        for (let row = 0; row < this.puzzleCells.length; row++) {
            for (let col = 0; col < this.puzzleCells[row].length; col++) {
                const cell = this.puzzleCells[row][col];
    
                if (cell && cell.modelCell.type === 'blank') {
                    cell.modelCell.state = 'unclicked';
                    cell.updateCellOutline(cell.graphics, cell.blankColors.outline);
                }
            }
        }
        this.controller.lastClickedRow = null;
        this.controller.lastClickedCol = null;
    }

    deselectAllPuzzleCells() {
        for (let row = 0; row < this.puzzleCells.length; row++) {
            for (let col = 0; col < this.puzzleCells[row].length; col++) {
                const cell = this.puzzleCells[row][col];

                if (cell && cell.modelCell.type === 'blank') {    
                    cell.modelCell.value = '';
                    cell.modelCell.note = []; // Set the value to an empty string or your desired default value
                    cell.updateValue();
                }
            }
        }
        this.controller.lastClickedRow = null;
        this.controller.lastClickedCol = null;
        this.controller.updateCheckedBoard();
    }

    resetAllPuzzleCells() {
        for (let row = 0; row < this.puzzleCells.length; row++) {
            for (let col = 0; col < this.puzzleCells[row].length; col++) {
                const cell = this.puzzleCells[row][col];
    
                if (cell && (cell.modelCell.type === 'blank' || cell.modelCell.type === 'correct' || cell.modelCell.type === 'incorrect'|| cell.modelCell.type === 'answer')) {
                    // Deselect all cell outlines
                    cell.modelCell.state = 'unclicked';
                    cell.modelCell.type = 'blank';
                    cell.updateCellOutline(cell.graphics, cell.blankColors.outline);
    
                    // Deselect all puzzle cells
                    cell.modelCell.value = '';
                    cell.modelCell.note = [];
                    cell.modelCell.answer = '';
                    cell.updateValue();
                    cell.updateNoteValue();
                }
            }
        }
        this.controller.lastClickedRow = null;
        this.controller.lastClickedCol = null;
        this.controller.updateCheckedBoard();
    }
    

    getStartX() {
        return this.startX;
    }
    
}
// a. Cell: Blank or Hint
class PuzzleCell {
    constructor(scene, x, y, cellWidth, cellHeight, cornerRadius, modelCell, clickHandler, controller) {
        this.scene = scene;
        this.x = x;
        this.y = y;
        this.cellWidth = cellWidth;
        this.cellHeight = cellHeight;
        this.cornerRadius = cornerRadius;
        this.modelCell = modelCell;
        this.clickHandler = clickHandler;
        this.controller = controller;

        this.initProperties();
        this.createGraphics();
    }

    initProperties() {
        this.hintColors = { fill: 0x000000, outline: 0x000000 };
        this.blankColors = { fill: 0xffffff, outline: 0xd0d0d0 };
        this.correctColors = { fill: 0xffffff, outline: 0x009e46 };
        this.incorrectColors = { fill: 0xffffff, outline: 0xff0000 };
        this.answerColors = { fill: 0xff0000, outline: 0xff0000 };

        this.textStyles = {
            hint: { fontFamily: 'Arial', fontSize: '35px', color: '#ffffff', align: 'center' },
            marker: { fontFamily: 'Arial', fontSize: '35px', color: '#000000', align: 'center' },
            note: { fontFamily: 'Arial', fontSize: '14.5px', color: '#0000ff', align: 'center' },
            correct: { fontFamily: 'Arial', fontSize: '35px', color: '#009e46', align: 'center' },
            incorrect: { fontFamily: 'Arial', fontSize: '35px', color: '#ff0000', align: 'center' },
            answer: { fontFamily: 'Arial', fontSize: '35px', color: '#ffffff', align: 'center' },

        };
    }

    createGraphics() {
        this.graphics = this.createRoundedCell(this.x, this.y, this.modelCell.type);
        this.setCellText(this.modelCell.type);

        if (this.modelCell.type !== 'hint') {
            this.addPointerdownListener(this.graphics);
        }
    }

    createRoundedCell(x, y, type) {
        const allColors = {
            hint: this.hintColors,
            blank: this.blankColors,
            correct: this.correctColors,
            incorrect: this.incorrectColors,
            answer: this.answerColors,
        };
        
        const colors = allColors[type] || this.blankColors;
        const graphics = this.scene.add.graphics();
        graphics.fillStyle(colors.fill, 1);
        graphics.lineStyle(2, colors.outline, 1);
        graphics.fillRoundedRect(x, y, this.cellWidth, this.cellHeight, this.cornerRadius);
        graphics.strokeRoundedRect(x, y, this.cellWidth, this.cellHeight, this.cornerRadius);
        return graphics;
    }

    setCellText(type) {
        let text = this.modelCell.value;
        let textStyle;
        if (type === 'hint') {
            textStyle = this.textStyles.hint;
        } else if (type === 'correct') {
            textStyle = this.textStyles.correct;
        } else if (type === 'incorrect') {
            textStyle = this.textStyles.incorrect;
        } else if (type === 'answer'){
            textStyle = this.textStyles.answer;
            text = this.modelCell.answer;
        } else {
            textStyle = this.textStyles.marker;
        }
    
        this.text = this.scene.add.text(this.x + this.cellWidth / 2, this.y + this.cellHeight / 2, text, textStyle);
        this.text.setOrigin(0.5);
    
        this.noteText = this.scene.add.text(this.x + this.cellWidth / 2, this.y + this.cellHeight / 2, this.modelCell.note, this.textStyles.note);
        this.noteText.setOrigin(0.5);
        this.noteText.setVisible(false);
    }
    

    formatNoteText(notes) {
        let formattedNote = '';
        for (let i = 0; i < notes.length; i++) {
            formattedNote += notes[i];
            if ((i + 1) % 3 === 0 && i < notes.length - 1) {
                formattedNote += '\n';
            } else if (i < notes.length - 1) {
                formattedNote += ',';
            }
        }
        return formattedNote;
    }

    revealAnswer() {
        if (this.modelCell.type === 'incorrect') {
            // Reveal the answer
            this.modelCell.type = 'answer';
    
            // Remove the old graphics and text
            this.graphics.destroy();
            this.text.destroy();
    
            // Create new graphics and text for the answer type
            this.graphics = this.createRoundedCell(this.x, this.y, "answer");
            this.setCellText("answer");
        } else {
            // Hide the answer
            this.modelCell.type = 'incorrect';
            this.hideAnswer();
        }
    }
    

    hideAnswer() {
        // Remove the old graphics and text
        this.graphics.destroy();
        this.text.destroy();
    
        // Create new graphics and text for the incorrect type
        this.graphics = this.createRoundedCell(this.x, this.y, "incorrect");
        this.setCellText("incorrect");
    }
    
    
    

    addPointerdownListener(graphics) {
        const rectangle = new Phaser.Geom.Rectangle(this.x, this.y, this.cellWidth, this.cellHeight);
        const hitArea = this.scene.add.graphics({ fillStyle: { color: 0x0000ff, alpha: 0.0 } });
        hitArea.fillRectShape(rectangle);
        hitArea.setInteractive(rectangle, Phaser.Geom.Rectangle.Contains);

        hitArea.on('pointerdown', () => {
            if (this.modelCell.type !== 'correct' && this.modelCell.state !== 'locked') {
                // console.log(this.modelCell.state);
                this.clickHandler(this.modelCell);
                if (this.controller.eraser !== true ) {
                    const newOutlineColor = this.modelCell.state === 'clicked' ? 0xffbe0b : this.blankColors.outline;
                    this.updateCellOutline(graphics, newOutlineColor);
                } 
                else if (this.controller.eraser === true) {
                    this.controller.handleClickInputCell('', 'eraser');
                    const newOutlineColor = this.modelCell.state === 'clicked' ? 0xffbe0b : this.blankColors.outline;
                    this.updateCellOutline(graphics, newOutlineColor);
                }
            } else if (this.modelCell.type === 'incorrect' || this.modelCell.type === 'answer') {
                this.revealAnswer();
            }
        });
        

        hitArea.on('pointerover', () => {
            if (this.modelCell.state !== 'clicked' && this.modelCell.state !== 'locked'  && (this.controller.eraser === true || this.controller.note === true || this.controller.marker === true)) {
                this.updateCellOutline(graphics, 0x979797);
            }
        });

        hitArea.on('pointerout', () => {
            if (this.modelCell.state !== 'clicked' && this.modelCell.state !== 'locked'  && (this.controller.eraser === true || this.controller.note === true || this.controller.marker === true)) {
                const newOutlineColor = this.modelCell.state === 'clicked' ? 0xffbe0b : this.blankColors.outline;
                this.updateCellOutline(graphics, newOutlineColor);
            }
        });
    }

    updateCellOutline(graphics, outlineColor) {
        graphics.clear();
        graphics.fillStyle(this.blankColors.fill, 1);
        graphics.lineStyle(2, outlineColor, 1);
        graphics.fillRoundedRect(this.x, this.y, this.cellWidth, this.cellHeight, this.cornerRadius);
        graphics.strokeRoundedRect(this.x, this.y, this.cellWidth, this.cellHeight, this.cornerRadius);
    }

    updateValue() {
        this.text.setText(this.modelCell.value);
        if (this.modelCell.value !== '') {
            // Hide the note text when an answer is present
            this.noteText.setVisible(false);
            this.modelCell.note = [];
        }
    }

    updateNoteValue() {
        const formattedNoteText = this.formatNoteText(this.modelCell.note);
        this.noteText.setText(formattedNoteText);
        if (this.modelCell.note.length > 0) {
            this.noteText.setVisible(true);
            // Clear the answer text and store it as empty when a note is added after the answer
            this.modelCell.value = '';
            this.text.setText('');
        } else {
            this.noteText.setVisible(false);
        }
    }
    
    reset() {
        // Reset the model cell's state
        this.modelCell.state = 'unclicked';
        this.modelCell.type = 'blank';
        this.modelCell.value = '';
        this.modelCell.note = [];
    
        // Reset the cell's graphics and text
        this.graphics.clear();
        this.graphics.fillStyle(this.blankColors.fill, 1);
        this.graphics.lineStyle(2, this.blankColors.outline, 1);
        this.graphics.fillRoundedRect(this.x, this.y, this.cellWidth, this.cellHeight, this.cornerRadius);
        this.graphics.strokeRoundedRect(this.x, this.y, this.cellWidth, this.cellHeight, this.cornerRadius);
    
        this.text.setText('');
        this.noteText.setText('');
        this.noteText.setVisible(false);
    }
    
}
// b. Constraint: Inequality
class PuzzleConstraint {
    constructor(scene, x, y, cellWidth, cellHeight, inequality) {
        this.scene = scene;
        this.x = x;
        this.y = y;
        this.cellWidth = cellWidth;
        this.cellHeight = cellHeight;
        this.inequality = inequality;

        if (this.inequality !== '') {
            this.draw();
        }
    }

    draw() {
        const centerX = this.x + this.cellWidth / 2;
        const centerY = this.y + this.cellHeight / 2;

        if (['^', '>', 'V', 'v', '<'].includes(this.inequality)) {
            this.drawTriangle(centerX, centerY, this.inequality);
        }
    }

    drawTriangle(centerX, centerY, inequality) {
        const base = this.cellWidth * 0.70;
        const height = base / 2;
        const rotationMap = { '^': 0, '>': 90, 'V': 180, 'v': 180, '<': 270 };
        const angle = rotationMap[inequality];
        this.scene.add.triangle(centerX, centerY, 0, height, base, height, height, 0, 0x000000).angle = angle;
    }
}



// Input Buttons
class PuzzleInput extends ViewPuzzle {
    constructor(model, scene, controller, inputOffsetY) {
        super(model, scene, controller);
        this.inputOffsetY = inputOffsetY;
        this.cellSize = 47;
        this.cornerRadius = 8;
        this.fillColor = 0xfff889;
        this.hoverFillColor = 0xfff000;
        this.outlineColor = 0x000000;
    }

    drawButton(x, y, value) {
        const graphics = this.scene.add.graphics();
    
        graphics.fillStyle(this.fillColor, 1);
        graphics.lineStyle(2, this.outlineColor, 1);
    
        const size = this.cellSize;
        const cornerRadius = this.cornerRadius;
    
        graphics.fillRoundedRect(x, y, size, size, cornerRadius);
        graphics.strokeRoundedRect(x, y, size, size, cornerRadius);
    
        const text = this.scene.add.text(x + size / 2, y + size / 2, value, {
            fontSize: '24px',
            color: '#000000',
        }).setOrigin(0.5);

        const button = { graphics, text };

        const rectangle = new Phaser.Geom.Rectangle(x, y, size, size);
        const hitArea = this.scene.add.graphics({ fillStyle: { color: 0x0000ff, alpha: 0.0 } });
        hitArea.fillRectShape(rectangle);
        hitArea.setInteractive(rectangle, Phaser.Geom.Rectangle.Contains);

        hitArea.on('pointerdown', () => {
            if(this.controller.marker === true){
                this.controller.handleClickInputCell(value, 'marker');
            } else if(this.controller.note === true){
                this.controller.handleClickInputCell(value, 'note');
            }
        });
        
        hitArea.on('pointerover', () => {
            this.changeButtonColor(button, x, y, this.hoverFillColor);
        });

        hitArea.on('pointerout', () => {
            this.changeButtonColor(button, x, y, this.fillColor);
        });
    }

    changeButtonColor(button, x, y, fillColor) {
        const { graphics } = button;
        const size = this.cellSize;
        const cornerRadius = this.cornerRadius;

        graphics.fillStyle(fillColor, 1);
        graphics.fillRoundedRect(x, y, size, size, cornerRadius);
        graphics.strokeRoundedRect(x, y, size, size, cornerRadius);
    }
    
    createButtons() {
        const gap = 20;
        const colNumber = (this.model.puzzle.board.length + 1) / 2;

        // Calculate the total width of the input buttons
        const totalInputWidth = colNumber * this.cellSize + (colNumber - 1) * gap;

        // Calculate the starting x position to center the input buttons
        const startX = (this.scene.scale.width - totalInputWidth) / 2;

        for (let col = 0; col < colNumber; col++) {
            const x = col * (this.cellSize + gap) + startX;
            const y = this.inputOffsetY;
            this.drawButton(x, y, col + 1);
        }
    }
}

// Submit puzzle button
class PuzzleSubmit extends ViewPuzzle {
    constructor(model, scene, controller, inputBottomY) {
        super(model, scene, controller);
        this.inputBottomY = inputBottomY;
        this.initProperties();
        this.createSubmitButton();
    }

    initProperties() {
        this.buttonColors = {
            normal: 0x009e46,
            hover: 0x00823b,
            outline: 0x000000,
        };
        this.textStyle = {
            fontFamily: 'Arial',
            fontSize: '24px',
            color: '#ffffff',
            align: 'center',
        };
    }

    createSubmitButton() {
        const buttonWidth = 180;
        const buttonHeight = 35;
        const cornerRadius = 12;
        const x = (this.scene.game.config.width - buttonWidth) / 2;
        const y = this.inputBottomY + 20; // Add some margin below the PuzzleInput

        // Create button graphics
        this.buttonGraphics = this.scene.add.graphics();
        this.drawButton(this.buttonColors.normal);

        // Create button text
        this.buttonText = this.scene.add.text(x + buttonWidth / 2, y + buttonHeight / 2, 'Submit Puzzle', this.textStyle);
        this.buttonText.setOrigin(0.5);

        // Add interactivity
        const buttonRectangle = new Phaser.Geom.Rectangle(x, y, buttonWidth, buttonHeight);
        this.buttonGraphics.setInteractive(buttonRectangle, Phaser.Geom.Rectangle.Contains);

        this.buttonGraphics.on('pointerdown', () => {
            this.controller.handleSubmit();
        });

        this.buttonGraphics.on('pointerover', () => {
            this.drawButton(this.buttonColors.hover);
        });

        this.buttonGraphics.on('pointerout', () => {
            this.drawButton(this.buttonColors.normal);
        });
    }

    drawButton(fillColor) {
        const buttonWidth = 180;
        const buttonHeight = 35;
        const cornerRadius = 12;
        const x = (this.scene.game.config.width - buttonWidth) / 2;
        const y = this.inputBottomY + 20; // Add some margin below the PuzzleInput

        this.buttonGraphics.clear();
        this.buttonGraphics.lineStyle(2, this.buttonColors.outline, 1);
        this.buttonGraphics.fillStyle(fillColor, 1);
        this.buttonGraphics.fillRoundedRect(x, y, buttonWidth, buttonHeight, cornerRadius);
        this.buttonGraphics.strokeRoundedRect(x, y, buttonWidth, buttonHeight, cornerRadius);
    }
}



//Leaderboard
class Leaderboard extends ViewPuzzle {
    constructor(model, scene, controller, cornerRadius, gap) {
      super(model, scene, controller);
      this.cornerRadius = cornerRadius;
      this.gap = gap;
      this.startX = 0;
    }
  
    createGraphics() {
      const puzzleBoardHeight = 100;
      this.drawBackground(puzzleBoardHeight);
    }
  
    drawBackground(puzzleBoardHeight) {
      const leaderboardData = this.model.leaderboard;
    //   const numberOfEntries = leaderboardData.length;
      const numberOfEntries = 10;
  
      const entryHeight = 100;
      const totalLeaderboardHeight = numberOfEntries * entryHeight;
  
      const padding = 20;
      const backgroundWidth = 400;
      const backgroundHeight = 600;

    //   const startX = this.controller.puzzleBoard.getStartX() + this.controller.puzzleBoard.cellWidth * this.model.puzzle.board[0].length + this.gap;
      const startX = 1000;

      // Set backgroundX and backgroundY to 0 for the origin (0, 0)
    const backgroundX = 1000;
    const backgroundY = 0;

    const backgroundColor = 0xf4f6f8;
    const graphics = this.scene.add.graphics();
    graphics.fillStyle(backgroundColor);
    graphics.fillRoundedRect(backgroundX, backgroundY, backgroundWidth, backgroundHeight, this.cornerRadius);

    this.startX = startX + padding;
  
      // Commented out the following line as requested:
      // this.buildLeaderboardEntries();
    }
  
    buildLeaderboardEntries() {
      // Commented out the entire method body as requested:
      /*
      const leaderboardData = this.model.leaderboard;
      const numberOfEntries = leaderboardData.length;
  
      const entryHeight = 30;
      const startX = this.startX;
      const startY = 70; // Adjust according to the desired top margin
  
      for (let i = 0; i < numberOfEntries; i++) {
        const entry = leaderboardData[i];
        const y = i * entryHeight + startY;
  
        // Create and display the leaderboard entry (e.g., text, rank, and score) using Phaser's text object
        const entryText = this.scene.add.text(startX, y, `${entry.rank}. ${entry.name} - ${entry.score}`, {
          fontSize: '16px',
          fill: '#000',
        });
      }
      */
    }
  }


  






