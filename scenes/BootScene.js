export class BootScene extends Phaser.Scene {
    constructor() {
        super('BootScene');
    }

    preload() {
        // Example asset loading (add your own later)
        // this.load.image('player', 'assets/player.png');
    }

    create() {
        // Go to intro dialogue scene after load
        this.scene.start('IntroScene');
    }
}