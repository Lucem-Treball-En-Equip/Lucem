export class Level1Scene extends Phaser.Scene {
    constructor() {
        super('Level1Scene');
    }

	preload() {
        this.load.tilemapTiledJSON('level1', '../resources/maps/level1new.json');
        this.load.image('tiles', '../resources/tiles2/tiles.png');
        this.load.image('b1', '../resources/tiles2/b1.png');

        this.load.spritesheet('player', '../resources/characters/player.png', {
            frameWidth: 80,
			frameHeight: 90
        });

        this.load.spritesheet('enemy', '../resources/characters/bears.png', {
            frameWidth: 120,
			frameHeight: 80
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

        // Enable collisions on certain layers
		groundLayer.setCollisionByExclusion([-1]);
		platformsLayer.setCollisionByExclusion([-1]);

        // Find player spawn from object layer
		const spawnPoint = map.findObject('SpawnPoints', obj => obj.name === 'Player');

        // Add player sprite (only first frame for now)
		this.player = this.physics.add.sprite(spawnPoint.x, spawnPoint.y, 'player', 0);
		this.player.setCollideWorldBounds(true);
		
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
            enemy.play('enemy_walk');
            enemy.setVelocityX(-50); // Comença movent-se cap a l’esquerra
            enemy.direction = 'left'; // Guardem direcció actual
            //enemy.body.setSize(50, 60); // Ajusta la hitbox si cal
		});

        this.anims.create({
            key: 'enemy_walk',
            frames: this.anims.generateFrameNumbers('enemy', { start: 8, end: 11 }),
            frameRate: 6,
            repeat: -1
        });

		// Collisions for enemies too
		this.physics.add.collider(this.enemies, groundLayer);
		this.physics.add.collider(this.enemies, platformsLayer);

		// Simple keyboard controls (temporary)
		this.cursors = this.input.keyboard.createCursorKeys();

    }

    update() {
		const speed = 200;

		this.player.setVelocity(0);

		if (this.cursors.left.isDown) {
			this.player.setVelocityX(-speed);
		} else if (this.cursors.right.isDown) {
			this.player.setVelocityX(speed);
		}

		if (this.cursors.up.isDown && this.player.body.onFloor()) {
			this.player.setVelocityY(-8000);
		}

        if (!this.player.body.onFloor()) {
			this.player.setVelocityY(50);
		}

        this.enemies.getChildren().forEach(enemy => {
            const touchingDown = enemy.body.blocked.down || enemy.body.touching.down;

            // Detector de buit al davant
            const nextX = enemy.x + (enemy.direction === 'left' ? -10 : 10);
            const nextY = enemy.y + 40;

            const tileBelow = platformsLayer.getTileAtWorldXY(nextX, nextY, true);
            const wallAhead = enemy.body.blocked.left || enemy.body.blocked.right;

            if (!tileBelow || wallAhead) {
                // Canviem direcció
                if (enemy.direction === 'left') {
                    enemy.direction = 'right';
                    enemy.setVelocityX(50);
                    enemy.setFlipX(true);
                } else {
                    enemy.direction = 'left';
                    enemy.setVelocityX(-50);
                    enemy.setFlipX(false);
                }
            }
        });
    }
}