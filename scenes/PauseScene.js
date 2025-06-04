export class PauseScene extends Phaser.Scene {
    constructor() {
        super('PauseScene');
    }

	preload() {
        this.load.image('pause', '../resources/dialog/pause.png');
    }

    init(data) {
        this.pausedSceneKey = data.returnTo; // Store the paused scene's key
    }
	
    create() {
		this.add.image(400, 300, 'pause').setOrigin(0.5); // 800x600 canvas
		
        this.input.keyboard.on('keydown-ESC', () => {
            this.scene.stop(); // Stop the pause scene
            this.scene.resume(this.pausedSceneKey); // Resume the level
        });
		
        this.input.keyboard.on('keydown-M', () => {
            this.scene.stop(); // Stop the pause scene
			window.location.href = "../index.html"; // Go to menu
        });
    }

}