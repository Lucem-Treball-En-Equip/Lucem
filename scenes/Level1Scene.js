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
            frameWidth: 55,
			frameHeight: 42
        });

		this.load.image('heart_icon', '../resources/dialog/heart_icon.png');
        this.load.image('bear_icon', '../resources/dialog/bear_icon.png');
        this.load.image('loot_icon', '../resources/dialog/loot_icon.png');
		this.load.image('skip', '../resources/dialog/skip.png');
        this.load.image('esc', '../resources/dialog/esc.png');
    }
	
    create() {
		// Initialise values
		if (this.registry.get('lives') === undefined) {
			this.registry.set('lives', 10);
			this.registry.set('treasures', 0);
			this.registry.set('kills', 0);
		}

		// Load map
		const map = this.make.tilemap({ key: 'level1' });

        // Adding tilesets
        const tiles = map.addTilesetImage('tiles', 'tiles');
        const b1 = map.addTilesetImage('b1', 'b1');

        // Tile layers
		const backgroundLayer = map.createLayer('Background', [tiles, b1], 0, 0);
		const groundLayer = map.createLayer('Ground', [tiles, b1], 0, 0);
		const platformsLayer = map.createLayer('Platforms', [tiles, b1], 0, 0);
		const fireLayer = map.createLayer('Foreground', [tiles, b1], 0, 0);

        // Enable collisions on certain layers
		groundLayer.setCollisionByExclusion([-1]);
		platformsLayer.setCollisionByExclusion([-1]);

		// Adding icons
		this.add.image(100, 40, 'heart_icon').setScrollFactor(0).setVisible(true);
		this.add.image(400, 40, 'loot_icon').setScrollFactor(0).setVisible(true);
		this.add.image(700, 40, 'bear_icon').setScrollFactor(0).setVisible(true);
        this.add.image(50, 570, 'esc').setScrollFactor(0).setVisible(true);

        // Find player spawn from object layer
		const spawnPoint = map.findObject('SpawnPoints', obj => obj.name === 'Player');

        // Add player sprite (only first frame for now)
		this.player = this.physics.add.sprite(spawnPoint.x, spawnPoint.y, 'player', 0);
		this.player.setCollideWorldBounds(true);

		// Player animations
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

		this.player.body.setGravityY(0); // gravity
		this.jumpVelocity = -20000;        // initial jump speed
		this.jumpTime = 0;
		this.isJumping = false;
		this.gravity = 1000;             // falling acceleration
		this.jumpDuration = 2000;         // jump duration
		this.maxJumpHeight = -20000; // initial vertical speed
		this.jumpAcceleration = 2000; // how fast is player jump stopping

		// jump to next level
		this.nextLevelZone = this.add.zone(map.widthInPixels - 100, map.heightInPixels - 100, 64, 64);
		this.physics.world.enable(this.nextLevelZone);  // physics
		this.nextLevelZone.body.setAllowGravity(false); // so the player doesn't fall
		this.nextLevelZone.body.setImmovable(true);     // so the player doesn't move
		this.nextLevelZone.body.setSize(200, 200);        

		// variable to control if the player is in the zone
		this.isPlayerInNextZone = false;
		this.isDead = false;

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
			enemy.setVelocityX(-50); // starts moving to the left
			enemy.direction = 'left'; // saving current direction
			enemy.startX = enemyObj.x; // saving current position
			enemy.lastHitTime = 0;
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
			//treasure.body.setSize(50, 35);
		});

		// Collisions for treasures too
		this.physics.add.collider(this.treasures, groundLayer);
		this.physics.add.collider(this.treasures, platformsLayer);
		//this.treasureFoundCount = 0;
		this.treasureFoundCount = this.registry.get('treasures');

		// Detecting overlap
		this.physics.add.overlap(this.player, this.treasures, (player, treasure) => {
			//increaseTreasureCount();        // increasing the global count
			treasure.disableBody(true, true);            // deleting item from the map
			this.treasureFoundCount++;
			this.registry.set('treasures', this.treasureFoundCount);
			this.lootText.setText('' + this.treasureFoundCount);
			console.log("Tresors trobats: " + this.treasureFoundCount);
		}, null, this);

		// Simple keyboard controls
		this.cursors = this.input.keyboard.createCursorKeys();

		this.attackKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);
		//this.enemyKillCount = 0; 
		this.enemyKillCount = this.registry.get('kills');
		//this.playerLives = 10;
		this.playerLives = this.registry.get('lives');

		this.livesText = this.add.text(112, 32, '' + this.playerLives, { fontSize: '18px', fill: '#fff' });
		this.livesText.setScrollFactor(0);
		this.lootText = this.add.text(412, 32, '' + this.treasureFoundCount, { fontSize: '18px', fill: '#fff' });
		this.lootText.setScrollFactor(0);
		this.bearsText = this.add.text(712, 32, '' + this.enemyKillCount, { fontSize: '18px', fill: '#fff' });
		this.bearsText.setScrollFactor(0);

		this.input.keyboard.on('keydown-ESC', () => {
            this.scene.pause();
            this.scene.launch('PauseScene', { returnTo: this.scene.key }); // Pass the current scene's key
        });
    }

    update() {
		const speed = 200;
		const isOnFloor = this.player.body.onFloor();
		const delta = this.game.loop.delta / 500;

		let moving = false;
		let right_left = false;
		
		this.player.setVelocityX(0);

		if (this.cursors.left.isDown) {
			this.player.setVelocityX(-speed);
			this.player.setFlipX(true);
			moving = true;
			right_left = false;
		} else if (this.cursors.right.isDown) {
			this.player.setVelocityX(speed);
			this.player.setFlipX(false);
			moving = true;
			right_left = true;
		}

		// Jump
		if (this.cursors.up.isDown && isOnFloor && !this.isJumping) {
			this.isJumping = true;
			this.jumpTime = 0;
			this.player.setVelocityY(this.maxJumpHeight);
			this.playerState = 'jump';
			this.player.play('jump', true);
		}

		// Keeping the jump while rising
		if (this.isJumping) {
			this.jumpTime += delta;

			if (right_left) {
				this.player.setVelocityX(speed*4);
			} else {
				this.player.setVelocityX(-speed*4);
			}

			// applyingh negative acceleration
			const newVelocityY = this.player.body.velocity.y - this.jumpAcceleration * delta;

			// ending the jump
			if (this.jumpTime > this.jumpDuration / 1000 || newVelocityY >= 0) {
				this.isJumping = false;
			} else {
				this.player.setVelocityY(newVelocityY);
			}
		}

		// applying gravity
		if (!this.player.body.onFloor() && !this.isJumping) {
			const newVelocityY = this.player.body.velocity.y + this.gravity * delta;
			this.player.setVelocityY(newVelocityY);
		}

		// no bouncing
		if (this.player.body.onFloor() && !this.cursors.up.isDown) {
			this.player.setVelocityY(0);
			this.isJumping = false;
		}

        // State machine
		if (!isOnFloor) {
			this.player.setVelocityY(200);
			this.playerState = 'jump';
			this.player.play('jump', true);
		} else if (moving) {
			if (this.cursors.down.isDown) {
				this.player.body.setSize(65, 75);
				this.playerState = 'crawl';
				this.player.play('crawl', true);
			} else {
				this.player.body.setSize(75, 85);
				this.playerState = 'run';
				this.player.play('run', true);
			}
		} else {
			if (this.cursors.down.isDown) {
				this.player.body.setSize(65, 75);
				this.playerState = 'crawl_idle';
				this.player.play('crawl_idle', true);
			} else {
				this.player.body.setSize(75, 85);
				this.playerState = 'idle';
				this.player.play('idle', true);
			}
		}

		// Attacking
		if (Phaser.Input.Keyboard.JustDown(this.attackKey)) {
			this.player.play('attack', true);

			// Player position
			const px = this.player.x;
			const py = this.player.y;

			// detection radius
			const detectionRadius = 120;

			// filter for enemies in range
			this.enemies.getChildren().forEach(enemy => {
				const distance = Phaser.Math.Distance.Between(px, py, enemy.x, enemy.y);

				if (distance <= detectionRadius && enemy.active) {
					enemy.disableBody(true, true); // deleting the enemy
					this.enemyKillCount++;
					this.registry.set('kills', this.enemyKillCount);
					this.bearsText.setText('' + this.enemyKillCount);
					console.log("Enemic eliminat. Total kills: " + this.enemyKillCount);
				}
			});
		}

		// resseting the variable before checking
		this.isPlayerInNextZone = false;

		// checking for overlap
		this.physics.overlap(this.player, this.nextLevelZone, () => {
			this.isPlayerInNextZone = true;
		}, null, this);

		// changing the scene
		if (this.isPlayerInNextZone && Phaser.Input.Keyboard.JustDown(this.input.keyboard.addKey('Q'))) {
			if (this.treasureFoundCount > 6) {
				console.log("Starting level 2");
				//alert('Level 2 starting!');
				this.scene.start('Level2Scene');
			} else {
				console.log("Insuffincient loot");
				alert('Collect all pieces of equipment!');
			}
		}

		// Enemy movements
		this.enemies.getChildren().forEach(enemy => {
			const tileBelow = enemy.body.blocked.down || enemy.body.touching.down;
			const wallAhead = enemy.body.blocked.left || enemy.body.blocked.right;

			if (!tileBelow || wallAhead || (Math.abs(enemy.x - enemy.startX) > 120)) {
				// changing the direction
				if (enemy.direction === 'left') {
					enemy.startX = enemy.x;
					enemy.direction = 'right';
					enemy.setFlipX(true);
					enemy.setVelocityX(100);
				} else {
					enemy.startX = enemy.x;
					enemy.direction = 'left';
					enemy.setFlipX(false);
					enemy.setVelocityX(-100);
				}
			}

			// player position
			const px = this.player.x;
			const py = this.player.y;

			// detection radius of the bear
			const detectionRadiusBear = 40;
			const distanceBear = Phaser.Math.Distance.Between(px, py, enemy.x, enemy.y);
			const currentTime = this.time.now;
			const pushAmount = 100;

			if (currentTime - enemy.lastHitTime > 1000) {
				if (distanceBear <= detectionRadiusBear && enemy.active) {
					enemy.lastHitTime = currentTime;
					this.playerLives--;
					this.registry.set('lives', this.playerLives);
					if (this.player.x < enemy.x) {
						// the enemy is to the right, push to the left
						this.player.x -= pushAmount;
					} else {
						// the enemy is to the left, push to the right
						this.player.x += pushAmount;
					}
					this.player.play('damage', true);
					this.player.setTint(0xff0000); // Red tint to indicate damage
					this.time.delayedCall(500, () => {
						this.player.clearTint(); // Remove the tint after 1 second
					});
					this.livesText.setText('' + this.playerLives);
					console.log("Player wounded. Lifes left: " + this.playerLives);

					if (this.playerLives <= 0) {
						this.isDead = true;
						this.player.setVelocity(0);
						this.player.anims.play('death');

						// desactivating controls
						this.physics.pause();
						this.player.setTint(0xff0000);

						// wait 3 second and change the scene
						this.time.delayedCall(3000, () => {
							this.scene.start('DeathScene');
						});
					}
				}
			}

			
		});
    }
}