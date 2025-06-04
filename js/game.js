import { BootScene } from '../scenes/BootScene.js';
import { IntroScene } from '../scenes/IntroScene.js';
import { Level1Scene } from '../scenes/Level1Scene.js';
import { Level2Scene } from '../scenes/Level2Scene.js';
import { Level3Scene } from '../scenes/Level3Scene.js';
import { EndingScene } from '../scenes/EndingScene.js';
import { DeathScene } from '../scenes/DeathScene.js';
import { PauseScene } from '../scenes/PauseScene.js';

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
	scene: [ BootScene, IntroScene, Level1Scene, Level2Scene, Level3Scene, EndingScene, DeathScene, PauseScene ]
};

const game = new Phaser.Game(config);