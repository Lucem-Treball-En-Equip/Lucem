export default class GameTypeScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameTypeScene' });
    }

    preload() {
    }

    create() {
        const width = this.sys.game.config.width;

        this.add.text(width / 2, 100, 'Choose a game mode:', {
            font: '38px Trebuchet MS Lucida Sans Unicode Lucida Grande Lucida Sans Arial sans-serif',
            fill: '#fff'
        }).setOrigin(0.5);

        //Mode 1
        const mode1Button = this.add.text(width / 2, 250, 'Regular Game', {
            font: '32px Trebuchet MS Lucida Sans Unicode Lucida Grande Lucida Sans Arial sans-serif',
            color: '#ff7db3'
        }).setOrigin(0.5)
        .setInteractive({ useHandCursor: true })
        .on('pointerover', () => mode1Button.setStyle({ color: '#fff' }))
        .on('pointerout', () => mode1Button.setStyle({ color: '#ff7db3' }))
        .on('pointerdown', () => {
            localStorage.setItem('gameMode', 1);
            this.scene.start('GameScene');
        });

        //Mode 2
        const mode2Button = this.add.text(width / 2, 350, 'Advanced Game', {
            font: '32px Trebuchet MS Lucida Sans Unicode Lucida Grande Lucida Sans Arial sans-serif',
            color: '#ff7db3'
        }).setOrigin(0.5)
        .setInteractive({ useHandCursor: true })
        .on('pointerover', () => mode2Button.setStyle({ color: '#fff' }))
        .on('pointerout', () => mode2Button.setStyle({ color: '#ff7db3' }))
        .on('pointerdown', () => {
            localStorage.setItem('gameMode', 2);
            this.scene.start('GameScene');
        });
    }
}
