import Phaser from '../startover/phaser';

import GameScene from './gameScene.js';

const config = {
  type: Phaser.AUTO,
  width: window.innerWidth,
  height: window.innerHeight,
  backgroundColor: '#ffffff',
  scene: GameScene
};

document.addEventListener("DOMContentLoaded", () => {
  const game = new Phaser.Game(config);
});