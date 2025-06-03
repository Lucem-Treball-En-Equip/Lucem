export class Level1Scene extends Phaser.Scene {
    constructor() {
        super('Level1Scene');
    }

	preload() {
        this.load.tilemapTiledJSON('level1', '../resources/maps/level1new.json');
        this.load.image('tiles', '../resources/tiles2/tiles.png');
        this.load.image('b1', '../resources/tiles2/b1.png');

        this.load.spritesheet('player', '../resources/characters/player.png', {
            frameWidth: 75,
			frameHeight: 85
        });

        this.load.spritesheet('enemy', '../resources/characters/bears.png', {
            frameWidth: 120,
			frameHeight: 80
        });

		this.load.spritesheet('treasure', '../resources/characters/treasure.png', {
            frameWidth: 75,
			frameHeight: 55
        });
    }
	
    create() {
		// Load map
		const map = this.make.tilemap({ key: 'level1' });

        // Afegim els tilesets (com coincideixen amb el nom definit a Tiled)
        const tiles = map.addTilesetImage('tiles', 'tiles');
        const b1 = map.addTilesetImage('b1', 'b1');

        // Tile layers
		const backgroundLayer = map.createLayer('Background', [tiles, b1], 0, 0);
        //backgroundLayer.setCollisionByProperty({ collides: true });

		const groundLayer = map.createLayer('Ground', [tiles, b1], 0, 0);
		const platformsLayer = map.createLayer('Platforms', [tiles, b1], 0, 0);
        //groundLayer.setCollisionByProperty({ collides: true });
        //platformsLayer.setCollisionByProperty({ collides: true });

        // Enable collisions on certain layers
		groundLayer.setCollisionByExclusion([-1]);
		platformsLayer.setCollisionByExclusion([-1]);

        // Find player spawn from object layer
		const spawnPoint = map.findObject('SpawnPoints', obj => obj.name === 'Player');

        // Add player sprite (only first frame for now)
		this.player = this.physics.add.sprite(spawnPoint.x, spawnPoint.y, 'player', 0);
		this.player.setCollideWorldBounds(true);

		this.anims.create({ key: 'idle', frames: [ { key: 'player', frame: 0 } ], frameRate: 1 }); //done
		this.anims.create({ key: 'run', frames: this.anims.generateFrameNumbers('player', { start: 6, end: 11 }), frameRate: 10, repeat: -1 }); //done
		this.anims.create({ key: 'jump', frames: [ { key: 'player', frame: 14 } ], frameRate: 1 }); //done
		this.anims.create({ key: 'attack', frames: this.anims.generateFrameNumbers('player', { start: 18, end: 22 }), frameRate: 12 });
		this.anims.create({ key: 'crawl_idle', frames: [ { key: 'player', frame: 24 } ], frameRate: 1 });
		this.anims.create({ key: 'crawl', frames: this.anims.generateFrameNumbers('player', { start: 24, end: 28 }), frameRate: 8, repeat: -1 }); //done
		this.anims.create({ key: 'crawl_attack', frames: this.anims.generateFrameNumbers('player', { start: 30, end: 33 }), frameRate: 10 });
		this.anims.create({ key: 'damage', frames: [ { key: 'player', frame: 1 } ], frameRate: 1 });
		this.anims.create({ key: 'death', frames: [ { key: 'player', frame: 35 } ], frameRate: 1 });

		this.playerState = 'idle';
		
        // Camera setup
		this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
		this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);

		// World bounds
		this.physics.world.setBounds(0, 0, map.widthInPixels, map.heightInPixels);

		// Player collisions
		this.physics.add.collider(this.player, groundLayer);
		this.physics.add.collider(this.player, platformsLayer);

        // Spawn enemies from object layer
		this.enemies = this.physics.add.group();
		map.getObjectLayer('Enemies').objects.forEach(enemyObj => {
			const enemy = this.enemies.create(enemyObj.x, enemyObj.y, 'enemy', 8);
			enemy.setCollideWorldBounds(true);
			this.anims.create({ key: 'enemy_walk',frames: this.anims.generateFrameNumbers('enemy', { start: 8, end: 11 }), frameRate: 6,repeat: -1});
			enemy.play('enemy_walk');
			enemy.setVelocityX(-50); // Comença movent-se cap a l’esquerra
			enemy.direction = 'left'; // Guardem direcció actual
			enemy.body.setSize(85, 60);
		});

		// Collisions for enemies too
		this.physics.add.collider(this.enemies, groundLayer);
		this.physics.add.collider(this.enemies, platformsLayer);

		// Spawn treasures from object layer
		this.treasures = this.physics.add.group();
		map.getObjectLayer('Treasures').objects.forEach(treasureObj => {
			const treasure = this.treasures.create(treasureObj.x, treasureObj.y, 'treasure', 0);
			treasure.setCollideWorldBounds(true);
			enemy.body.setSize(50, 35);
		});

		// Collisions for treasures too
		this.physics.add.collider(this.treasures, groundLayer);
		this.physics.add.collider(this.treasures, platformsLayer);

		// Simple keyboard controls (temporary)
		this.cursors = this.input.keyboard.createCursorKeys();

    }

    update() {
		const speed = 200;
		const isOnFloor = this.player.body.onFloor();

		let moving = false;
		
		this.player.setVelocity(0);

		if (this.cursors.left.isDown) {
			this.player.setVelocityX(-speed);
			this.player.setFlipX(true);
			moving = true;
		} else if (this.cursors.right.isDown) {
			this.player.setVelocityX(speed);
			this.player.setFlipX(false);
			moving = true;
		}

		// Salt
		if (this.cursors.up.isDown && isOnFloor) {
			this.player.setVelocityY(-15000);
			this.playerState = 'jump';
			this.player.play('jump', true);
		}

        // Estats
		if (!isOnFloor) {
			this.player.setVelocityY(200);
			this.playerState = 'jump';
			this.player.play('jump', true);
		} else if (moving) {
			if (this.cursors.down.isDown) {
				//this.player.body.setSize(75, 75);
				this.playerState = 'crawl';
				this.player.play('crawl', true);
			} else {
				//this.player.body.setSize(75, 85);
				this.playerState = 'run';
				this.player.play('run', true);
			}
		} else {
			if (this.cursors.down.isDown) {
				//this.player.body.setSize(75, 75);
				this.playerState = 'crawl_idle';
				this.player.play('crawl_idle', true);
			} else {
				//this.player.body.setSize(75, 85);
				this.playerState = 'idle';
				this.player.play('idle', true);
			}
		}

		this.enemies.getChildren().forEach(enemy => {
			const tileBelow = enemy.body.blocked.down || enemy.body.touching.down;
			const wallAhead = enemy.body.blocked.left || enemy.body.blocked.right;

			if (!tileBelow || wallAhead) {
				// Canviem direcció
				if (enemy.direction === 'left') {
					enemy.direction = 'right';
					enemy.setFlipX(true);
					enemy.setVelocityX(100);
				} else {
					enemy.direction = 'left';
					enemy.setFlipX(false);
					enemy.setVelocityX(-100);
				}
			}
		});
    }
}