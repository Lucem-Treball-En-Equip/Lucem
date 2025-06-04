export class BootScene extends Phaser.Scene {
    constructor() {
        super('BootScene');
    }

    preload() {
        
    }

    create() {
        // Go to intro dialogue scene after load
        this.scene.start('IntroScene');
    }
}