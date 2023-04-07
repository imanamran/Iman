// Use the ECMAScript module system
import Model from '../startover/model.js.js.js';

// import View from './view';
// import Controller from './controller';

class GameScene extends Phaser.Scene {
  constructor() {
    super('Game');
  }

  preload() {
    // load images
    this.load.image('note', 'assets/note.png');
    this.load.image('marker', 'assets/marker.png');
    this.load.image('eraser', 'assets/eraser.png');
  }

  create() {
    // Create instances of Model, View, and Controller
    this.model = new Model();
    this.view = new View(this);
    this.controller = new Controller(this.model, this.view);

    // Any additional setup or initializations can be done here
  }

  update() {
    // Update game objects here
  }
}

export default GameScene;
