class KingArthursDungeon extends Phaser.Scene {
    constructor() {
        super("kingArthursDungeon");
    }

    init() {
        // variables and settings
        this.ACCELERATION = 1000;
        this.VELOCITY = 250;
        this.DRAG = 900;
        this.physics.world.gravity.y = 1350;
        this.JUMP_VELOCITY = -600;

        this.VELOCITY_CLIMB = 130;
        this.CLIMB_IDLE_DROP_SPEED = 35;

        this.onLadder = false;

        //health stuff
        this.healthValue = 10;
        this.coolDown = 0;

        this.teleportCooldown = 0;

        this.moneyCount = 0;
        this.frameCount = 0;
        this.stopwatchTime = 0;

        this.fastestTime = 0;
    }

    create() {
        this.map = this.add.tilemap("dungeon", 16, 16, 20, 100);
        this.tileset = this.map.addTilesetImage("monochrome_tilemap_packed", "monochrome_tilemap_packed");
        this.tilesetTransparent = this.map.addTilesetImage("monochrome_tilemap_transparent_packed", "monochrome_tilemap_transparent_packed");

        this.platforms = this.map.createLayer("Platforms", this.tileset, 0, 0);
        this.platforms.setScale(SCALE);
        this.invisibles = this.map.createLayer("Invisibles", this.tilesetTransparent, 0, 0);
        this.invisibles.setScale(SCALE);
        this.invisibles.setDepth(10);
        this.climbables = this.map.createLayer("Climbables", this.tilesetTransparent, 0, 0);
        this.climbables.setScale(SCALE);
        this.climbables.setDepth(10);
        this.spikes = this.map.createLayer("Spikes", this.tileset, 0, 0);
        this.spikes.setScale(SCALE);
        this.doors = this.map.createLayer("Doors", this.tileset, 0, 0);
        this.doors.setScale(SCALE);
        this.end = this.map.createLayer("End", this.tileset, 0, 0);
        this.end.setScale(SCALE);

        this.platforms.setCollisionByProperty({ collides: true });
        this.climbables.setCollisionByProperty({ climbable: true });

        my.sprite.player = this.physics.add.sprite(16, 16, "tilemap_sheet", 260).setScale(SCALE);
        this.physics.world.setBounds(0, 0, 800, 4000);
        my.sprite.player.setCollideWorldBounds(true);
        this.physics.world.TILE_BIAS = 30;

        this.physics.add.collider(my.sprite.player, this.platforms);

        this.coins = this.map.createFromObjects("Collectables", {
            name: "coin",
            key: "tilemap_sheet",
            frame: 102
        });
        this.diamonds = this.map.createFromObjects("Collectables", {
            name: "diamond",
            key: "tilemap_sheet",
            frame: 62
        });

        this.coins.forEach(coin => {
            coin.setScale(SCALE);
            coin.x *= SCALE;
            coin.y *= SCALE;
            coin.setDepth(-10);
        });

        this.diamonds.forEach(diamond => {
            diamond.setScale(SCALE);
            diamond.x *= SCALE;
            diamond.y *= SCALE;
            diamond.setDepth(-10);
        });

        const padding = 16;

        // Calculate right-side x-position
        const rightX = this.scale.width - padding;

        // Money Text
        this.moneyText = this.add.text(0, 16, 'Money Collected: £' + this.moneyCount, {
            fontFamily: 'Trebuchet MS',
            fontSize: '20px',
            fill: '#ffffff'
        });
        this.moneyText.setScrollFactor(0);
        this.moneyText.setDepth(50);
        this.moneyText.setOrigin(1, 0); // Align text to top-right
        this.moneyText.x = rightX;

        // Health Text
        this.healthText = this.add.text(0, 40, 'Health: ' + this.healthValue, {
            fontFamily: 'Trebuchet MS',
            fontSize: '20px',
            fill: '#ffffff'
        });
        this.healthText.setScrollFactor(0);
        this.healthText.setDepth(50);
        this.healthText.setOrigin(1, 0); // Align text to top-right
        this.healthText.x = rightX;

        this.timeText = this.add.text(0, 64, 'Time: ' + 0, {
            fontFamily: 'Trebuchet MS',
            fontSize: '20px',
            fill: '#ffffff'
        });
        this.timeText.setScrollFactor(0);
        this.timeText.setDepth(50);
        this.timeText.setOrigin(1, 0); // Align text to top-right
        this.timeText.x = rightX;

        // Background Rectangle behind both
        const maxTextWidth = Math.max(this.moneyText.width, this.healthText.width);
        this.bg = this.add.rectangle(
            this.scale.width - maxTextWidth - padding - 10, // 10px padding inside the box
            this.moneyText.y - 5,
            maxTextWidth + 20,
            this.moneyText.height + this.healthText.height + this.timeText.height+ 14,
            0x000000,
            0.8
        ).setOrigin(0);
        this.bg.setScrollFactor(0);
        this.bg.setDepth(40);


        this.physics.world.enable(this.coins, Phaser.Physics.Arcade.STATIC_BODY);
        this.physics.world.enable(this.diamonds, Phaser.Physics.Arcade.STATIC_BODY);

        this.coinGroup = this.add.group(this.coins);
        this.diamondGroup = this.add.group(this.diamonds);

        const collectableParticle = this.add.particles(16, 16, 'tilemap_sheet', {
            frame: 1,
            scale: { start: 0.2, end: 0 },
            emitting: false,
            duration: 50,
            lifespan: 1000,
            speed: { min: 100, max: 200 },
            angle: { min: 0, max: 360 },
            quantity: 5,
            rotate: { start: 0, end: 360 },
            gravityY: 0,
            emitZone: {
                type: 'edge',
                source: new Phaser.Geom.Circle(0, 0, 1),
                quantity: 7
            }
        });

        collectableParticle.setDepth(30);

        this.physics.add.overlap(my.sprite.player, this.coinGroup, (obj1, obj2) => {
            obj2.destroy(); // remove coin on overlap
            this.moneyCount+=1000;
            console.log("Money Collected: £" + this.moneyCount);
            this.updateUIText();
            collectableParticle.x = (my.sprite.player.x);
            collectableParticle.y = (my.sprite.player.y);
            collectableParticle.start();
            this.sound.play('collect', { volume: 0.1 , detune: 300 });
        });

        this.physics.add.overlap(my.sprite.player, this.diamondGroup, (obj1, obj2) => {
            obj2.destroy(); // remove coin on overlap
            this.moneyCount+=500;
            this.moneyText.setText('Money Collected: £' + this.moneyCount);
            this.updateUIText();
            collectableParticle.x = (my.sprite.player.x);
            collectableParticle.y = (my.sprite.player.y);
            collectableParticle.start();
            this.sound.play('collect', { volume: 0.1 });
        });

        this.aKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
        this.dKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
        this.wKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
        this.sKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
        this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        this.mKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.M);

        this.physics.add.overlap(my.sprite.player, this.climbables, () => {
            this.onLadder = true;
        }, null, this);

        this.cameras.main.setDeadzone(400, 300);
        this.cameras.main.setBounds(0, 0, 800, 4000);
        this.cameras.main.startFollow(my.sprite.player);

        this.fallDamageVelocityThreshold = 910;
        this.wasFalling = false;


        // enemies stuff
        this.hoverEnemies = [];
        const hover1 = new HoverEnemy(this, 216*SCALE, (232-32)*SCALE, (232+32)*SCALE);
        const hover2 = new HoverEnemy(this, 136*SCALE, (392-32)*SCALE, (392+32)*SCALE);
        const hover3 = new HoverEnemy(this, 88*SCALE, (976-(32+32)-8)*SCALE, (976-8)*SCALE);
        this.hoverEnemies.push(hover1, hover2, hover3);

        this.crawlerEnemies = [];
        const crawler1 = new CrawlerEnemy(this, (16+8)*SCALE, (16+8+96)*SCALE, (272-8)*SCALE);
        const crawler2 = new CrawlerEnemy(this, (192+8)*SCALE, (192+8+80)*SCALE, (608-8)*SCALE);
        const crawler3 = new CrawlerEnemy(this, (112+8)*SCALE, (112+8+80)*SCALE, (752-8)*SCALE);
        this.crawlerEnemies.push(crawler1, crawler2, crawler3);

        this.hornedCrawlerEnemies = [];
        const hornedCrawler1 = new HornedCrawler(this, (112+8)*SCALE, (112+8+64)*SCALE, (944-8)*SCALE);
        const hornedCrawler2 = new HornedCrawler(this, (144+8)*SCALE, (144+8+64)*SCALE, (1072-8)*SCALE);
        this.hornedCrawlerEnemies.push(hornedCrawler1, hornedCrawler2);

        this.TurtleEnemies = [];
        const turtle1 = new Turtle(this, (112+8)*SCALE, (112+8+96)*SCALE, (1456-8)*SCALE);
        this.TurtleEnemies.push(turtle1);

        this.soundtrack = this.sound.add('soundtrack', { volume: 0.15, loop: true });
        this.soundtrack.play();

        this.isMuted = false;

        this.fastestTime = localStorage.getItem('fastestTime');
    }

    update(time, delta) {
        this.frameCount++;
        this.onLadder = false;

        const deltaSec = delta / 1000;
        this.stopwatchTime += deltaSec;

        const playerTileClimbablesX = this.climbables.worldToTileX(my.sprite.player.x);
        const playerTileClimbablesY = this.climbables.worldToTileY(my.sprite.player.y);
        const tileClimbables = this.climbables.hasTileAt(playerTileClimbablesX, playerTileClimbablesY);

        const playerTileSpikesX = this.spikes.worldToTileX(my.sprite.player.x);
        const playerTileSpikesY = this.spikes.worldToTileY(my.sprite.player.y);
        const tileSpikes = this.spikes.hasTileAt(playerTileSpikesX, playerTileSpikesY);

        const playerEndX = this.end.worldToTileX(my.sprite.player.x);
        const playerEndY = this.end.worldToTileY(my.sprite.player.y);
        const tileEnd = this.end.hasTileAt(playerEndX, playerEndY);


        const isOnGround = my.sprite.player.body.blocked.down;
        const fallVelocity = my.sprite.player.body.velocity.y;

        if (!isOnGround && fallVelocity > this.fallDamageVelocityThreshold) {
            this.wasFalling = true;
        }

        if (isOnGround && this.wasFalling) {
            this.healthValue -= 1;
            this.cameras.main.shake(70);
            console.log("Fall damage taken. Health is at: " + this.healthValue);
            this.wasFalling = false;
            this.sound.play('hitHurt', { volume: 0.6 });
            this.cameras.main.flash(300, 150, 0, 0);
            this.healthText.setText('Health: ' + this.healthValue);
            this.updateUIText();
        }


        if (tileClimbables) {
            this.onLadder = true;
        } else if (tileSpikes && (this.coolDown < 0)) {
            this.healthValue-=0.5;
            this.coolDown = 30;
            this.cameras.main.shake(30);
            console.log("Touched a spike. Health is at: " + this.healthValue);
            this.sound.play('hitHurt', { volume: 0.6 });
            this.cameras.main.flash(300, 50, 0, 0);
            this.healthText.setText('Health: ' + this.healthValue);
            this.updateUIText();
        } else if (!tileSpikes) {
            this.coolDown = 0;
        }

        if (this.teleportCooldown <= 0) {
            const tileX = this.doors.worldToTileX(my.sprite.player.x);
            const tileY = this.doors.worldToTileY(my.sprite.player.y);
            const doorTile = this.doors.getTileAt(tileX, tileY);

            if (doorTile && doorTile.properties.teleportable) {
                console.log("Teleporting...");
                my.sprite.player.setPosition(7 * 16 * SCALE, 27 * 16 * SCALE);  // Adjusted for world scale
                this.teleportCooldown = 120;  // About 1 second if you're running at 60 FPS
                //mimick warp effect
                this.warpEffect();
            }
        }


        if (this.onLadder) {
            my.sprite.player.body.allowGravity = false;
            my.sprite.player.body.setAccelerationX(0);
            my.sprite.player.body.setDragX(0);

            
            my.sprite.player.body.setVelocityX(0);
            my.sprite.player.anims.play('climb', true);
            if (this.wKey.isDown) {
                my.sprite.player.body.setVelocityY(-this.VELOCITY_CLIMB);
            } else if (this.sKey.isDown) {
                my.sprite.player.body.setVelocityY(this.VELOCITY_CLIMB);
            } else {
                my.sprite.player.body.setVelocityY(this.CLIMB_IDLE_DROP_SPEED);
            } 
        } else {
            my.sprite.player.body.allowGravity = true;
        }


        if (this.aKey.isDown) {
            my.sprite.player.body.setAccelerationX(-this.ACCELERATION);
            my.sprite.player.body.setVelocityX(-this.VELOCITY);
            my.sprite.player.setFlip(true, false);
            my.sprite.player.anims.play('run', true);
            //my.sprite.player.setScale(SCALE);
        } else if (this.dKey.isDown) {
            my.sprite.player.body.setAccelerationX(this.ACCELERATION);
            my.sprite.player.body.setVelocityX(this.VELOCITY);
            my.sprite.player.resetFlip();
            my.sprite.player.anims.play('run', true);
            //my.sprite.player.setScale(SCALE);
        } else if (!this.onLadder) {
            my.sprite.player.body.setAccelerationX(0);
            my.sprite.player.body.setDragX(this.DRAG);
            my.sprite.player.anims.play('idle');
        }


        if ((!my.sprite.player.body.blocked.down) && (!this.onLadder)) {
            my.sprite.player.anims.play('jump');
        }
        if (my.sprite.player.body.blocked.down && (Phaser.Input.Keyboard.JustDown(this.spaceKey) || Phaser.Input.Keyboard.JustDown(this.wKey))) {
            my.sprite.player.body.setVelocityY(this.JUMP_VELOCITY);
            this.sound.play('jump', { volume: 0.1 , detune: -400 });
        }

        this.coolDown--;
        this.teleportCooldown--;

        if (isOnGround) {
            this.wasFalling = false;
        }

        if (this.healthValue <= 0) {
            this.deathEffect()
            this.soundtrack.stop();
            this.scene.start("loseScene");
        }

        // enemy movement
        this.hoverEnemies.forEach(enemy => {
            enemy.update();
            enemy.checkPlayerCollision(my.sprite.player);
        });

        this.crawlerEnemies.forEach(enemy => {
            enemy.update();
            enemy.checkPlayerCollision(my.sprite.player);
        });

        this.hornedCrawlerEnemies.forEach(enemy => {
            enemy.update();
            enemy.checkPlayerCollision(my.sprite.player);
        });

        this.TurtleEnemies.forEach(enemy => {
            enemy.update();
            enemy.checkPlayerCollision(my.sprite.player);
        });

        if (Phaser.Input.Keyboard.JustDown(this.mKey)) {
            if (this.isMuted == false) {
                this.soundtrack.setVolume(0);
                this.isMuted = true;
            } else {
                this.soundtrack.setVolume(0.15);
                this.isMuted = false;
            }
        }

        if (tileEnd) {
            this.soundtrack.stop();
            localStorage.setItem('time', ''+(Math.round(this.stopwatchTime * 100) / 100));
            if ((!this.fastestTime) || (this.fastestTime > (Math.round(this.stopwatchTime * 100) / 100))) {
                localStorage.setItem('fastestTime', ''+(Math.round(this.stopwatchTime * 100) / 100));
            }
            localStorage.setItem('moneyCollected', ''+this.moneyCount);
            this.scene.start("winScene");
        }

        this.timeText.setText('Time: ' + (Math.round(this.stopwatchTime)));
    }

    warpEffect() {
        this.cameras.main.flash(300, 100, 0, 200);
        this.cameras.main.shake(300, 0.01);

        this.cameras.main.zoomTo(2, 200, 'Power2', true, (_, progress) => {
            if (progress === 1) {
                this.time.delayedCall(100, () => {
                    this.cameras.main.zoomTo(1, 200, 'Power2');
                });
            }
        });
        this.sound.play('teleport', { volume: 0.6 });
    }

    deathEffect(){
        this.cameras.main.flash(300, 300, 0, 0);
        this.cameras.main.shake(300, 0.03);

        this.cameras.main.zoomTo(2, 200, 'Power2', true, (_, progress) => {
            if (progress === 1) {
                this.time.delayedCall(100, () => {
                    this.cameras.main.zoomTo(1, 200, 'Power2');
                });
            }
        });
    }

    updateUIText() {
        const padding = 16;
        const innerPadding = 10;
        const rightX = this.scale.width - padding;

        // Update text content
        this.moneyText.setText('Money Collected: £' + this.moneyCount);
        this.healthText.setText('Health: ' + this.healthValue);

        // Set X to right-aligned
        this.moneyText.x = rightX;
        this.healthText.x = rightX;
        this.timeText.x = rightX;

        // Calculate new background width/height
        const maxTextWidth = Math.max(this.moneyText.width, this.healthText.width, this.timeText.width);
        const totalHeight = this.moneyText.height + this.healthText.height + this.timeText.height + 14;

        this.bg.setSize(maxTextWidth + innerPadding * 2, totalHeight);
        this.bg.setPosition(
            this.scale.width - maxTextWidth - padding - innerPadding,
            this.moneyText.y - 5
        );
    }
}

        // hoverEnemyX = 208;
        // hoverEnemyYMax = 272;
        // hoverEnemyYMin = 240;

class HoverEnemy {
    constructor(scene, x, yMin, yMax) {
        this.scene = scene;

        // Create a sprite instead of follower
        this.sprite = scene.add.sprite(x, yMax, 'hoverEnemy');
        scene.add.existing(this.sprite);

        this.sprite.setScale(SCALE);
        this.sprite.play('hover');

        // Create vertical hover motion
        scene.tweens.add({
            targets: this.sprite,
            y: yMin,
            duration: 3000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
    }

    update() {

    }

    checkPlayerCollision(player, damage = 1.5, cooldown = 60) {
        if (!this.cooldown) this.cooldown = 0;

        if (Phaser.Geom.Intersects.RectangleToRectangle(this.sprite.getBounds(), player.getBounds())) {
            if (this.cooldown <= 0) {
                this.scene.healthValue -= damage;
                this.scene.healthText.setText('Health: ' + this.scene.healthValue);
                this.scene.cameras.main.shake(100);
                this.scene.cameras.main.flash(300, 200, 0, 0);
                this.scene.sound.play('hitHurt', { volume: 0.6 });
                this.cooldown = cooldown;
            }
        }

        if (this.cooldown > 0) this.cooldown--;
    }
}


class CrawlerEnemy {
    constructor(scene, xMin, xMax, y) {
        this.scene = scene;

        // Define spline points for vertical hover motion
        this.curve = new Phaser.Curves.Spline([
            xMin, y,
            xMax, y
        ]);

        // Create a follower sprite along the curve
        this.sprite = scene.add.follower(this.curve, xMin, y, "crawler");
        this.sprite.setScale(SCALE);  // Optional: set size
        this.sprite.visible = true;
        this.sprite.play('crawl');

        // Enable physics if needed (optional)
        //scene.physics.add.existing(this.sprite);

        // Start hover movement
        this.sprite.x = this.curve.points[0].x;
        this.sprite.y = this.curve.points[0].y;
        this.sprite.startFollow({
            from: 0,
            to: 1,
            duration: 4000,
            ease: 'Linear',
            repeat: -1,
            yoyo: true,
            rotateToPath: false // true if you want the ship to rotate
        });
    }

    update() {
        // You can put additional behavior here (e.g., animations or shooting)
    }

    checkPlayerCollision(player, damage = 1.5, cooldown = 60) {
        if (!this.cooldown) this.cooldown = 0;

        if (Phaser.Geom.Intersects.RectangleToRectangle(this.sprite.getBounds(), player.getBounds())) {
            if (this.cooldown <= 0) {
                this.scene.healthValue -= damage;
                this.scene.healthText.setText('Health: ' + this.scene.healthValue);
                this.scene.cameras.main.shake(100);
                this.scene.cameras.main.flash(300, 200, 0, 0);
                this.scene.sound.play('hitHurt', { volume: 0.6 });
                this.cooldown = cooldown;
            }
        }

        if (this.cooldown > 0) this.cooldown--;
    }
}

class HornedCrawler {
    constructor(scene, xMin, xMax, y) {
        this.scene = scene;

        // Create a sprite instead of follower
        this.sprite = scene.add.sprite(xMin, y, 'hoverEnemy');
        scene.add.existing(this.sprite);

        this.sprite.setScale(SCALE);
        this.sprite.play('hornedCrawl');

        // Create vertical hover motion
        scene.tweens.add({
            targets: this.sprite,
            x: xMax,
            duration: 2000,
            yoyo: true,
            repeat: -1,
            ease: 'Linear'
        });
    }

    update() {

    }

    checkPlayerCollision(player, damage = 1.5, cooldown = 60) {
        if (!this.cooldown) this.cooldown = 0;

        if (Phaser.Geom.Intersects.RectangleToRectangle(this.sprite.getBounds(), player.getBounds())) {
            if (this.cooldown <= 0) {
                this.scene.healthValue -= damage;
                this.scene.healthText.setText('Health: ' + this.scene.healthValue);
                this.scene.cameras.main.shake(100);
                this.scene.cameras.main.flash(300, 200, 0, 0);
                this.scene.sound.play('hitHurt', { volume: 0.6 });
                this.cooldown = cooldown;
            }
        }

        if (this.cooldown > 0) this.cooldown--;
    }
}

class Turtle {
    constructor(scene, xMin, xMax, y) {
        this.scene = scene;

        // Create a sprite instead of follower
        this.sprite = scene.add.sprite(xMin, y, 'hoverEnemy');
        scene.add.existing(this.sprite);

        this.sprite.setScale(SCALE);
        this.sprite.play('turtle');

        // Create vertical hover motion
        scene.tweens.add({
            targets: this.sprite,
            x: xMax,
            duration: 600,
            yoyo: true,
            repeat: -1,
            ease: 'Linear'
        });
    }

    update() {

    }

    checkPlayerCollision(player, damage = 1.5, cooldown = 60) {
        if (!this.cooldown) this.cooldown = 0;

        if (Phaser.Geom.Intersects.RectangleToRectangle(this.sprite.getBounds(), player.getBounds())) {
            if (this.cooldown <= 0) {
                this.scene.healthValue -= damage;
                this.scene.healthText.setText('Health: ' + this.scene.healthValue);
                this.scene.cameras.main.shake(100);
                this.scene.cameras.main.flash(300, 200, 0, 0);
                this.scene.sound.play('hitHurt', { volume: 0.6 });
                this.cooldown = cooldown;
            }
        }

        if (this.cooldown > 0) this.cooldown--;
    }
}