// create a new scene
let gameScene = new Phaser.Scene('Game');

// load asset files for our game
gameScene.preload = function() {
    // load images
    this.load.image('default', 'assets/default_state.png');
    this.load.image('clicked', 'assets/clicked_state.png');
    this.load.image('background', 'assets/background.png');
    this.load.image('note_default', 'assets/note_default.png');
    this.load.image('note_clicked', 'assets/note_clicked.png');
    this.load.image('marker_default', 'assets/marker_default.png');
    this.load.image('marker_clicked', 'assets/marker_clicked.png');
    this.load.image('eraser_default', 'assets/eraser_default.png');
    this.load.image('eraser_clicked', 'assets/eraser_clicked.png');
};

let bgWidth = window.innerWidth > 400 ? 400 : window.innerWidth;
let bgHeight = window.innerHeight > 400 ? 400 : window.innerHeight;

if (bgWidth > bgHeight) {
    bgWidth = bgHeight;
} else {
    bgHeight = bgWidth;
}

// called once after the preload ends
gameScene.create = function() {
    const numRows = 4; // the number of rows
    const numCols = 4; // the number of columns

    // calculate the size of each box based on the background size and number of columns/rows
    const boxSize = Math.floor(bgWidth / (numCols + 1));
    const spacing = Math.floor((bgWidth - (numCols * boxSize)) / (numCols + 1));

    // create button section such as note, marker and eraser
    const buttonSection = 0;

    // create the eraser
    const eraser = this.add.sprite(buttonSection,buttonSection, 'eraser_default');
    eraser.setData('eraser', false);
    eraser.setOrigin(0);
    eraser.displayWidth = boxSize/2;
    eraser.displayHeight = boxSize/2;
    eraser.setInteractive();

    // create the note
    const note = this.add.sprite(buttonSection,buttonSection, 'note_default');
    note.setData('note', false);
    note.setOrigin(0);
    note.setPosition(buttonSection + boxSize/2 + 5, buttonSection);
    note.displayWidth = boxSize/2;
    note.displayHeight = boxSize/2;
    note.setInteractive();

    // create the marker
    const marker = this.add.sprite(buttonSection,buttonSection, 'marker_default');
    marker.setData('marker', false);
    marker.setOrigin(0);
    marker.setPosition(buttonSection + boxSize/2 + 50, buttonSection);
    marker.displayWidth = boxSize/2;
    marker.displayHeight = boxSize/2;
    marker.setInteractive();

    eraser.on('pointerdown', function() {
        // toggle between selected and not selected eraser
        if (eraser.texture.key === 'eraser_default') {
            eraser.setTexture('eraser_clicked');
            eraser.setData('eraser', true);
            console.log(eraser.getData('eraser'));
        }
        else {
            eraser.setTexture('eraser_default');
            eraser.setData('eraser', false);
            console.log(eraser.getData('eraser'));
        }
    });
    

    note.on('pointerdown', function() {
        // toggle between selected and not selected note
        if (note.texture.key === 'note_default') {
            note.setTexture('note_clicked');
            note.setData('note', true);
            console.log(note.getData('note'));
        }
        else {
            note.setTexture('note_default');
            note.setData('note', false);
            console.log(note.getData('note'));
        }
    });

    marker.on('pointerdown', function() {
        // toggle between selected and not selected marker
        if (marker.texture.key === 'marker_default') {
            marker.setTexture('marker_clicked');
            marker.setData('marker', true);
            console.log(marker.getData('marker'));
        }
        else {
            marker.setTexture('marker_default');
            marker.setData('marker', false);
            console.log(marker.getData('marker'));
        }
    });



    const backgroundSection = buttonSection + 50

    // create the background sprite
    const bg = this.add.sprite(0, 0, 'background');
    bg.setOrigin(0, 0);
    bg.setPosition(0, backgroundSection);
    bg.displayWidth = bgWidth;
    bg.displayHeight = bgHeight;

    // create the stack to keep track of clicked boxes
    const clickedBoxes = [];

    // create the grid of boxes with array indices and data
    const boxes = [];
    for (let row = 0; row < numRows; row++) {
        const rowArray = [];
        for (let col = 0; col < numCols; col++) {
            const index = [row,col];
            const boxData = {
                index: index,
                note: [],
                marker: 0,
                clicked: false
            };
            rowArray.push(boxData);

            // calculate the position of the box based on its row and column
            const x =  spacing + col * (boxSize + spacing);
            const y = backgroundSection+ spacing + row * (boxSize + spacing);

            // create the box sprite
            const box = this.add.sprite(x, y, 'default');
            box.setOrigin(0, 0);
            box.displayWidth = boxSize;
            box.displayHeight = boxSize;
            box.setInteractive();

            // create the text object and add it to the box sprite
            const dataText = this.add.text(0, 0, boxData.note.join(', '), { fontFamily: 'Permanent Marker', color: '#000000', fontSize: '16px' });
            dataText.setOrigin(0.5);
            dataText.setPosition(x + boxSize/2, y + boxSize/2);
            box.dataText = dataText;

            // if(note.getData('note') === false){
            //     box.setTexture('default');
            //     boxData.clicked = false;
            // }

            // add event listener for clicking on the box
            box.on('pointerdown', function() {
                // toggle between default and clicked states
                if (note.getData('note') === true && box.texture.key === 'default') {

                    // // unclick all other boxes
                    // clickedBoxes.forEach(function(box) {
                    //     box.setTexture('default');
                    //     box.clicked = false;
                    // });

                    box.setTexture('clicked');
                    clickedBoxes.push(boxData);
                    boxData.clicked = true;
                    console.log(boxData);
                } else if (note.getData('note') === true && box.texture.key === 'clicked') {
                    box.setTexture('default');
                    boxData.clicked = false;
                    const index = clickedBoxes.findIndex(box => box.index === boxData.index);
                    if (index > -1) {
                        clickedBoxes.splice(index, 1);
                    }
                    console.log(boxData);
                }
                
               // add or remove data from the clicked box
                if (box.texture.key === 'clicked') {
                    // listen for key input
                    gameScene.input.keyboard.on('keydown', function(event) {
                        // check if the key pressed is a number
                        if (event.key >= '0' && event.key <= numRows && boxData.note.length < numRows) {
                            boxData.note.push(parseInt(event.key));
                            // update the data text
                            box.dataText.setText(boxData.note.join(','));
                            console.log(boxData)
                        }
                    });
                } else {
                    boxData.note = [];
                    // remove the key input listener
                    gameScene.input.keyboard.off('keydown');
                }
            });
        }
        boxes.push(rowArray);
    }


    // add event listener for unclicking all boxes
    this.input.keyboard.on('keydown_ESC', function() {
        clickedBoxes.forEach(function(box) {
            box.setTexture('default');
            clickedBoxes.pop();
        });
        clickedBoxes.length = 0;
    });
};

let config = {
    type: Phaser.AUTO,
    width: window.innerWidth,
    height: window.innerHeight,
    backgroundColor: '#ffffff',
    scene: gameScene
};

// create a new game, pass the configuration
let game = new Phaser.Game(config);