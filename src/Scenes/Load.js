class Load extends Phaser.Scene {
    constructor() {
        super("loadScene");
    }

    preload() {
        this.load.setPath("./assets/");

        // Load characters spritesheet
        //this.load.atlas("platformer_characters", "monochrome_tilemap_packed.png", "tilemap-characters-packed.json");

        // Load tilemap information
        this.load.image("monochrome_tilemap_packed", "monochrome_tilemap_packed.png");                         // Packed tilemap
        this.load.image("monochrome_tilemap_transparent_packed", "monochrome_tilemap_transparent_packed.png"); 
        this.load.tilemapTiledJSON("dungeon", "dungeon.json");   // Tilemap in JSON

        this.load.spritesheet("tilemap_sheet", "monochrome_tilemap_transparent_packed.png", {
            frameWidth: 16,
            frameHeight: 16
        });

        this.load.audio("hitHurt", "Sounds/hitHurt.wav");
        this.load.audio("jump", "Sounds/jump.wav");
        this.load.audio("pickupCoin", "Sounds/pickupCoin.wav");
        this.load.audio("powerUp", "Sounds/powerUp.wav");
        this.load.audio("teleport", "Sounds/teleport.wav");
        this.load.audio("soundtrack", "Sounds/soundtrack.wav");
        this.load.audio("collect", "Sounds/pickupCoin.wav");
    }

    create() {
        this.anims.create({
            key: 'run',
            frames: this.anims.generateFrameNames('tilemap_sheet',
                {start: 261, end: 264}
            ),
            frameRate: 20,
            other_animation_props: true,
        });

        this.anims.create({
            key: 'idle',
            frames: this.anims.generateFrameNames('tilemap_sheet',
                {start: 260, end: 260}
            ),
            frameRate: 10,
            other_animation_props: true,
        });

        this.anims.create({
            key: 'climb',
            frames: this.anims.generateFrameNames('tilemap_sheet',
                {start: 265, end: 265}
            ),
            other_animation_props: true,
        });

        this.anims.create({
            key: 'jump',
            frames: this.anims.generateFrameNames('tilemap_sheet',
                {start: 264, end: 264}
            ),
            other_animation_props: true,
        });

        this.anims.create({
            key: 'hover',
            frames: this.anims.generateFrameNames('tilemap_sheet',
                {start: 380, end: 381}
            ),
            other_animation_props: true,
            frameRate: 10,
            repeat: -1
        });

        this.anims.create({
            key: 'crawl',
            frames: this.anims.generateFrameNames('tilemap_sheet',
                {start: 321, end: 322}
            ),
            other_animation_props: true,
            frameRate: 3,
            repeat: -1
        });

        this.anims.create({
            key: 'hornedCrawl',
            frames: this.anims.generateFrameNames('tilemap_sheet',
                {start: 341, end: 342}
            ),
            other_animation_props: true,
            frameRate: 3,
            repeat: -1
        });

        this.anims.create({
            key: 'turtle',
            frames: this.anims.generateFrameNames('tilemap_sheet',
                {start: 364, end: 364}
            ),
            other_animation_props: true,
            frameRate: 3,
            repeat: -1
        });

        document.getElementById('description').innerHTML = '<h2>Downspiral: King Arthur\'s Dungeon</h2><br>Controls: <br><br> <br>- A: left<br><br>- D: right<br><br>- W: up/jump<br><br>- S: down<br> <br>- Space: jump<br> <br>- M: mute/unmute<br> <br>Go down King Arthur\'s Dungeon to get to the his treasure!<br>'

         // ...and pass to the next Scene
         this.scene.start("kingArthursDungeon");
    }

    // Never get here since a new scene is started in create()
    update() {
    }
}