import GameTypeScene from '../scenes/GameTypeScene.js';
import GameScene from '../scenes/GameScene.js';

const config = {
    type: Phaser.AUTO,
    width: 1030,
    height: 720,
	scale: 1.5,
    parent: 'gameContainer',
    backgroundColor: '#01003C',
    scene: [GameTypeScene, GameScene]
};

const game = new Phaser.Game(config);

addEventListener('load', function() {
    document.getElementById('exit_game').addEventListener('click', 
    function(){
        window.location.assign("../index.html");
    });
});

document.getElementById('save_game').addEventListener('click', () => {
    const gameScene = game.scene.getScene('GameScene');
    if (gameScene && typeof gameScene.saveGame === 'function') {
        gameScene.saveGame();
    } else {
        alert("The game is not loaded yet!");
    }
});