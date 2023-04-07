class MyScene extends Phaser.Scene {
    constructor() {
        super('MyScene');
    }

    preload() {
        this.load.image('eraser', 'assets/eraser.png');
        this.load.image('note', 'assets/note.png');
        this.load.image('marker', 'assets/marker.png');
        this.load.image('reset', 'assets/reset.png');
    }

    create() {
        // I. Model -> Controller -> View


        // Model -> Controller
        // 1. Get data from the server in a form of a dimension array

        //  a. Create a Controller
        const controller = new ControllerPuzzle();

        //  b. Create a Model
        const model = new ModelPuzzle(dimensionArray, controller);
        controller.setModel(model);


        // Controller -> View
        // 2. Give data to the puzzle in View

        //  a. Create a View
        const view = new ViewPuzzle(model, this, controller);
        controller.setView(view);
        view.createPuzzleViews();
    


        // II. View -> Controller -> Model


        // View -> Controller
        // 3. Listen to events from the puzzle in View (Line 24 & Line 37)
        // get row and col from the board cell
        // get value from the input cell


        // Controller -> Model 
        // 4. Update data in the model (Line 51)



        // III. Model -> Controller -> View


        // Model -> Controller
        // 5. Retrieve data from the model
    }

    getBoard() {
        return this.model.board;
    }
}

const config = {
    type: Phaser.WEBGL,
    parent: 'game-container', // Add this line to specify the parent container
    width: window.innerWidth,
    height: window.innerHeight,
    scene: [MyScene],
    render: {
      pixelArt: false,
    },
    backgroundColor: 0xffffff,
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  };

const game = new Phaser.Game(config);