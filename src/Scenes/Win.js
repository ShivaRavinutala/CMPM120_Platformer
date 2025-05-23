class Win extends Phaser.Scene {
    constructor() {
        super("winScene");
    }

    preload() {
        this.load.setPath("./assets/");
        this.load.image("monochrome_tilemap_transparent_packed", "monochrome_tilemap_transparent_packed.png"); 
        this.load.tilemapTiledJSON("winScene", "winScene.json");
    }

    create() {
        this.map = this.add.tilemap("winScene", 16, 16, 20, 20);
        this.tilesetTransparent = this.map.addTilesetImage("monochrome_tilemap_transparent_packed", "monochrome_tilemap_transparent_packed");

        this.sceneMap = this.map.createLayer("Tile Layer 1", this.tilesetTransparent, 0, 0);
        this.sceneMap.setScale(SCALE);
        this.sceneMap.setDepth(40);

        this.title = this.add.text(160, 160, "You Won!", {
            fontFamily: 'Trebuchet MS',
            fontSize: '120px',
            color: '#ffffff',
            fontStyle: 'bold',
        });

        this.title.setOrigin(0.5, 0.5);
        this.title.setPosition(400, 250);

        this.timeText = this.add.text(160, 160, "Time: "+localStorage.getItem('time'), {
            fontFamily: 'Trebuchet MS',
            fontSize: '15px',
            color: '#ffffff',
            fontStyle: 'bold',
        });

        this.timeText.setOrigin(0.5, 0.5);
        this.timeText.setPosition(400, 350);

        this.fastestTimeText = this.add.text(160, 160, "Fastest Time: "+localStorage.getItem('fastestTime'), {
            fontFamily: 'Trebuchet MS',
            fontSize: '15px',
            color: '#ffffff',
            fontStyle: 'bold',
        });

        this.fastestTimeText.setOrigin(0.5, 0.5);
        this.fastestTimeText.setPosition(400, 380);

        this.moneyCollectedText = this.add.text(160, 160, "Money Collected: £"+localStorage.getItem('moneyCollected'), {
            fontFamily: 'Trebuchet MS',
            fontSize: '15px',
            color: '#ffffff',
            fontStyle: 'bold',
        });

        this.moneyCollectedText.setOrigin(0.5, 0.5);
        this.moneyCollectedText.setPosition(400, 410);

        this.keyPressText = this.add.text(160, 160, "Press Space to Continue", {
            fontFamily: 'Trebuchet MS',
            fontSize: '40px',
            color: '#ffffff',
            fontStyle: 'bold',
        });

        this.keyPressText.setOrigin(0.5, 0.5);
        this.keyPressText.setPosition(400, 500);
        this.nextScene = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    }

    update() {
        if (Phaser.Input.Keyboard.JustDown(this.nextScene)) {
            this.scene.start("mainMenu");
        }
    }
}