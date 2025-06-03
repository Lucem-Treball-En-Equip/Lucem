export class Level1Scene extends Phaser.Scene {
    constructor() {
        super('Level1Scene');
    }

	preload() {
        this.load.tilemapTiledJSON('level1', '../resources/maps/level1new.json');
        this.load.image('tiles', '../resources/tiles2/tiles.png');
        this.load.image('b1', '../resources/tiles2/b1.png');

        this.load.spritesheet('player', '../resources/characters/player.png', {
            frameWidth: 40,
			frameHeight: 42
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
        groundLayer.setCollisionByProperty({ collides: true });
        platformsLayer.setCollisionByProperty({ collides: true });

        // Enable collisions on certain layers
		//groundLayer.setCollisionByExclusion([-1]);
		//platformsLayer.setCollisionByExclusion([-1]);

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
			const enemy = this.enemies.create(enemyObj.x, enemyObj.y, 'enemy', 0);
			enemy.setCollideWorldBounds(true);
		});

		// Collisions for enemies too
		this.physics.add.collider(this.enemies, groundLayer);
		this.physics.add.collider(this.enemies, platformsLayer);

		// Simple keyboard controls (temporary)
		this.cursors = this.input.keyboard.createCursorKeys();

    }

    update() {
		const speed = 160;

		this.player.setVelocity(0);

		if (this.cursors.left.isDown) {
			this.player.setVelocityX(-speed);
		} else if (this.cursors.right.isDown) {
			this.player.setVelocityX(speed);
		}

		if (this.cursors.up.isDown && this.player.body.onFloor()) {
			this.player.setVelocityY(-300);
		}
    }
}