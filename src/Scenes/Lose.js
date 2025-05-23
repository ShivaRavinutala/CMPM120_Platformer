class Lose extends Phaser.Scene {
    constructor() {
        super("loseScene");
    }

    preload() {

    }

    create() {
        this.title = this.add.text(160, 160, "You Lost", {
            fontFamily: 'Trebuchet MS',
            fontSize: '120px',
            color: '#ffffff',
            fontStyle: 'bold',
        });

        this.title.setOrigin(0.5, 0.5);
        this.title.setPosition(400, 250);

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