var config = {
  type: Phaser.AUTO,
  parent: 'phaser-example',
  width: 800,
  height: 600,
  backgroundColor: '#ffffff',
  scene: {
    create: create
  }
};

var game = new Phaser.Game(config);

function create() {
    // up
    const up = this.add.triangle(100, 100, 0, 20, 40, 20, 20, 0, 0x000000);

    // right
    const right = this.add.triangle(200, 100, 0, 20, 40, 20, 20, 0, 0x000000);
    right.angle = 90;
    
    // down
    const down = this.add.triangle(300, 100, 0, 20, 40, 20, 20, 0, 0x000000);
    down.angle = 180;

    // left
    const left = this.add.triangle(400, 100, 0, 20, 40, 20, 20, 0, 0x000000);
    left.angle = 270;
}
