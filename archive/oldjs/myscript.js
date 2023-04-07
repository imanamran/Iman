//OOP version of the game

// create a new scene
let gameScene = new Phaser.Scene('Game');

class GameScene extends Phaser.Scene {
  constructor() {
      super('Game');
      this.bgWidth = window.innerWidth > 400 ? 400 : window.innerWidth;
      this.bgHeight = window.innerHeight > 400 ? 400 : window.innerHeight;

      if (this.bgWidth > this.bgHeight) {
          this.bgWidth = this.bgHeight;
      } else {
          this.bgHeight = this.bgWidth;
      }
  }

  preload() {
      // load images
      this.load.image('default', 'assets/default_state.png');
      this.load.image('clicked', 'assets/clicked_state.png');
      this.load.image('background', 'assets/background.png');
      this.load.image('note_default', 'assets/note_default.png');
      this.load.image('note_clicked', 'assets/note_clicked.png');
  }

  create() {
      // Create game objects
      const numRows = 4; // the number of rows
      const numCols = 4; // the number of columns

      // calculate the size of each box based on the background size and number of columns/rows
      const boxSize = Math.floor(this.bgWidth / (numCols + 1));
      const spacing = Math.floor((this.bgWidth - (numCols * boxSize)) / (numCols + 1));
      this.boxSize = boxSize; // make boxSize available to other classes

      // create button section such as note, marker, and eraser
      const buttonSection = 0;

      // create the note
      const note = new Note(this, buttonSection, buttonSection, 'note_default');
      this.add.existing(note);

      const backgroundSection = buttonSection + 50;

      // create the background sprite
      const bg = this.add.sprite(0, 0, 'background');
      bg.setOrigin(0, 0);
      bg.setPosition(0, backgroundSection);
      bg.displayWidth = this.bgWidth;
      bg.displayHeight = this.bgHeight;

      // create the stack to keep track of clicked boxes
      const clickedBoxes = [];

      // create the grid of boxes with array indices and data
      const boxes = [];
      for (let row = 0; row < numRows; row++) {
          const rowArray = [];
          for (let col = 0; col < numCols; col++) {
              const x = spacing + col * (boxSize + spacing);
              const y = backgroundSection + spacing + row * (boxSize + spacing);

              // create the box sprite
              const box = new Box(this, x, y, 'default', boxSize, row, col);
              this.add.existing(box);
              rowArray.push(box);

              // Add event listeners and other logic for boxes here
          }
          boxes.push(rowArray);
      }

      // Add event listeners and other logic for the note object here
  }
}

class Box extends Phaser.GameObjects.Sprite {
  constructor(scene, x, y, texture, boxSize, row, col) {
      super(scene, x, y, texture);
      this.setOrigin(0, 0);
      this.displayWidth = boxSize;
      this.displayHeight = boxSize;
      this.row = row;
      this.col = col;
      this.boxData = {
          index: [row, col],
          note: [],
          marker: 0,
          clicked: false
      };
      this.setInteractive();

      // Create the text object and add it to the box sprite
      const dataText = scene.add.text(0, 0, this.boxData.note.join(', '), { color: '#000000', fontSize: '16px' });
      dataText.setOrigin(0.5);
      dataText.setPosition(x + boxSize / 2, y + boxSize / 2);
      this.dataText = dataText;

      // Add event listener for clicking on the box
      this.on('pointerdown', () => {
          this.handleClick(scene);
      });
  }

  handleClick(scene) {
      // Check if note is selected
      const note = scene.children.getByName('note');
      if (note.isSelected() && this.texture.key === 'default') {
          this.setTexture('clicked');
          this.boxData.clicked = true;
      } else if (note.isSelected() && this.texture.key === 'clicked') {
          this.setTexture('default');
          this.boxData.clicked = false;
      }

      if (this.texture.key === 'clicked') {
          // Listen for key input
          scene.input.keyboard.on('keydown', (event) => {
              // Check if the key pressed is a number
              if (event.key >= '0' && event.key <= '9' && this.boxData.note.length < this.row) {
                  this.boxData.note.push(parseInt(event.key));
                  this.dataText.setText(this.boxData.note.join(','));
              }
          });
      } else {
          this.boxData.note = [];
          scene.input.keyboard.off('keydown');
      }
  }
}

const config = {
  type: Phaser.AUTO,
  width: 400,
  height: 400,
  scene: [GameScene],
  scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH
  }
};

const game = new Phaser.Game(config);

