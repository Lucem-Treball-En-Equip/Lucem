export class Level2Scene extends Phaser.Scene {
    constructor() {
        super('Level2Scene');
    }

	preload() {
        this.load.tilemapTiledJSON('level2', '../resources/maps/level2new.json');
        this.load.image('tiles', '../resources/tiles2/tiles.png');
        this.load.image('b2', '../resources/tiles2/b2.png');

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
		// Load map
		const map = this.make.tilemap({ key: 'level2' });

        // Afegim els tilesets (com coincideixen amb el nom definit a Tiled)
        const tiles = map.addTilesetImage('tiles', 'tiles');
        const b2 = map.addTilesetImage('b2', 'b2');

        // Tile layers
		const backgroundLayer = map.createLayer('Background', [tiles, b2], 0, 0);
        //backgroundLayer.setCollisionByProperty({ collides: true });

		const groundLayer = map.createLayer('Ground', [tiles, b2], 0, 0);
		const platformsLayer = map.createLayer('Platforms', [tiles, b2], 0, 0);
		const fireLayer = map.createLayer('Foreground', [tiles, b2], 0, 0);
        //groundLayer.setCollisionByProperty({ collides: true });
        //platformsLayer.setCollisionByProperty({ collides: true });

        // Enable collisions on certain layers
		groundLayer.setCollisionByExclusion([-1]);
		platformsLayer.setCollisionByExclusion([-1]);

		this.add.image(100, 40, 'heart_icon').setScrollFactor(0).setVisible(true);
		this.add.image(400, 40, 'loot_icon').setScrollFactor(0).setVisible(true);
		this.add.image(700, 40, 'bear_icon').setScrollFactor(0).setVisible(true);
		//this.add.image(750, 570, 'skip').setScrollFactor(0).setVisible(true);
        this.add.image(50, 570, 'esc').setScrollFactor(0).setVisible(true);

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

		this.player.body.setGravityY(0); // Gestionarem la gravetat manualment
		this.jumpVelocity = -20000;        // Velocitat inicial de salt (negativa)
		this.jumpTime = 0;
		this.isJumping = false;
		this.gravity = 1000;             // Acceleració positiva per caiguda
		this.jumpDuration = 2000;         // ms que dura la pujada (0.8 segons)
		this.maxJumpHeight = -20000; // velocitat vertical inicial màxima
		this.jumpAcceleration = 2000; // com de ràpid s’atura durant el salt

		// jump to next level
		this.nextLevelZone = this.add.zone(map.widthInPixels - 100, map.heightInPixels - 100, 64, 64);
		this.physics.world.enable(this.nextLevelZone);  // Habilitem física
		this.nextLevelZone.body.setAllowGravity(false); // Que no caigui
		this.nextLevelZone.body.setImmovable(true);     // Que no es mogui
		this.nextLevelZone.body.setSize(200, 200);        // Ajustem la mida si cal

		// Variable per controlar si el jugador està a la zona
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
			const enemy = this.enemies.create(enemyObj.x, enemyObj.y, 'enemy', 4);
			enemy.setCollideWorldBounds(true);
			this.anims.create({ key: 'enemy_walk',frames: this.anims.generateFrameNumbers('enemy', { start: 4, end: 7 }), frameRate: 6,repeat: -1});
			enemy.play('enemy_walk');
			enemy.setVelocityX(-50); // Comença movent-se cap a l’esquerra
			enemy.direction = 'left'; // Guardem direcció actual
			enemy.startX = enemyObj.x; // Guardem posició inicial
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

		// Detectar overlap entre player i tresors
		this.physics.add.overlap(this.player, this.treasures, (player, treasure) => {
			//increaseTreasureCount();        // incrementem la puntuació global
			treasure.disableBody(true, true);            // eliminem el tresor del mapa
			this.treasureFoundCount++;
			this.registry.set('treasures', this.treasureFoundCount);
			this.lootText.setText('' + this.treasureFoundCount);
			console.log("Tresors trobats: " + this.treasureFoundCount);
		}, null, this);

		// Simple keyboard controls (temporary)
		this.cursors = this.input.keyboard.createCursorKeys();

		this.attackKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);
		//this.enemyKillCount = 0; // Inicialitzem contador local de morts
		this.enemyKillCount = this.registry.get('kills');
		//this.playerLives = 10;
		this.playerLives = this.registry.get('lives');

		this.livesText = this.add.text(112, 32, '' + this.playerLives, { fontSize: '18px', fill: '#fff' });
		this.livesText.setScrollFactor(0); // perquè es mantingui a la càmera
		this.lootText = this.add.text(412, 32, '' + this.treasureFoundCount, { fontSize: '18px', fill: '#fff' });
		this.lootText.setScrollFactor(0);
		this.bearsText = this.add.text(712, 32, '' + this.enemyKillCount, { fontSize: '18px', fill: '#fff' });
		this.bearsText.setScrollFactor(0);
    }

    update() {
		const speed = 200;
		const isOnFloor = this.player.body.onFloor();
		const delta = this.game.loop.delta / 500; // pas a segons

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

		// Salt
		if (this.cursors.up.isDown && isOnFloor && !this.isJumping) {
			this.isJumping = true;
			this.jumpTime = 0;
			this.player.setVelocityY(this.maxJumpHeight);
			this.playerState = 'jump';
			this.player.play('jump', true);
		}

		// Mantenir el salt si s'està dins el temps de pujada
		if (this.isJumping) {
			this.jumpTime += delta;

			if (right_left) {
				this.player.setVelocityX(speed*4);
			} else {
				this.player.setVelocityX(-speed*4);
			}

			// aplicar acceleració negativa per simular la frenada
			const newVelocityY = this.player.body.velocity.y - this.jumpAcceleration * delta;

			// Si ja ha passat el temps màxim de salt o estem caient, acabem el salt
			if (this.jumpTime > this.jumpDuration / 1000 || newVelocityY >= 0) {
				this.isJumping = false;
			} else {
				this.player.setVelocityY(newVelocityY);
			}
		}

		// Gravetat per caiguda (només si no saltem i no estem tocant terra)
		if (!this.player.body.onFloor() && !this.isJumping) {
			const newVelocityY = this.player.body.velocity.y + this.gravity * delta;
			this.player.setVelocityY(newVelocityY);
		}

		// EVITAR REBOTS: al tocar terra, forcem velocitat vertical a 0
		if (this.player.body.onFloor() && !this.cursors.up.isDown) {
			this.player.setVelocityY(0);
			this.isJumping = false;
		}

        // Estats
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

		// Comprovem si s'ha premut la tecla d'atac
		if (Phaser.Input.Keyboard.JustDown(this.attackKey)) {
			this.player.play('attack', true);

			// Coordenades del jugador
			const px = this.player.x;
			const py = this.player.y;

			// Radi de detecció
			const detectionRadius = 120;

			// Filtrar enemics dins el radi
			this.enemies.getChildren().forEach(enemy => {
				const distance = Phaser.Math.Distance.Between(px, py, enemy.x, enemy.y);

				if (distance <= detectionRadius && enemy.active) {
					enemy.disableBody(true, true); // Elimina l’enemic
					this.enemyKillCount++;
					this.registry.set('kills', this.enemyKillCount);
					this.bearsText.setText('' + this.enemyKillCount);
					console.log("Enemic eliminat. Total kills: " + this.enemyKillCount);
				}
			});
		}

		// Reset la variable abans de fer la comprovació
		this.isPlayerInNextZone = false;

		// Comprovem si està overlap
		this.physics.overlap(this.player, this.nextLevelZone, () => {
			this.isPlayerInNextZone = true;
		}, null, this);

		// Si està dins la zona i prem Q, canviem escena
		if (this.isPlayerInNextZone && Phaser.Input.Keyboard.JustDown(this.input.keyboard.addKey('Q'))) {
			if (this.treasureFoundCount > 13) {
				console.log("Starting level 3");
				//alert('Level 3 starting!');
				this.scene.start('Level3Scene');
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
				// Canviem direcció
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

			// Coordenades del jugador
			const px = this.player.x;
			const py = this.player.y;

			// Radi de detecció
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
						// L'enemic està a la dreta, empeny cap a l'esquerra
						this.player.x -= pushAmount;
					} else {
						// L'enemic està a l'esquerra, empeny cap a la dreta
						this.player.x += pushAmount;
					}
					this.player.play('damage', true);
					this.player.setTint(0xff0000); // Red tint to indicate damage
					this.time.delayedCall(500, () => {
						player.clearTint(); // Remove the tint after 1 second
					});
					this.livesText.setText('' + this.playerLives);
					console.log("Player wounded. Lifes left: " + this.playerLives);

					if (this.playerLives <= 0) {
						this.isDead = true;
						this.player.setVelocity(0);
						this.player.anims.play('death');

						// Desactiva col·lisions, controls, etc.
						this.physics.pause();
						this.player.setTint(0xff0000);

						// Espera 3 segons i canvia d’escena
						this.time.delayedCall(3000, () => {
							this.scene.start('DeathScene');
						});
					}
				}
			}

			
		});
    }
}