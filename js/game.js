import { BootScene } from '../scenes/BootScene.js';
import { IntroScene } from '../scenes/IntroScene.js';

const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    parent: 'game-container',
	backgroundColor: '#ff65ff',
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 1000 },
            debug: false
        }
    },
    //scene: [ BootScene, IntroScene, Level1Scene, Level2Scene, Level3Scene, EndingScene, PauseMenuScene ]
	scene: [ BootScene, IntroScene ]
};

const game = new Phaser.Game(config);