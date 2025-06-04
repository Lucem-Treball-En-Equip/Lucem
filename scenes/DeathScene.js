export class DeathScene extends Phaser.Scene {
    constructor() {
        super('DeathScene');
    }

	preload() {
        this.load.image('black', '../resources/backgrounds/black.png');
		this.load.image('frame', '../resources/dialog/frame.png');
        this.load.image('d4', '../resources/dialog/d4.png');
        this.load.image('skip', '../resources/dialog/skip.png');
        this.load.image('esc', '../resources/dialog/esc.png');

        this.load.audio('dead', '../resources/audio/dead.mp3');
    }
	
    create() {
		this.add.image(400, 300, 'black').setOrigin(0.5); // 800x600 canvas
        this.add.image(750, 570, 'skip').setScrollFactor(0).setVisible(true);
        this.add.image(50, 570, 'esc').setScrollFactor(0).setVisible(true);

        const music = this.registry.get('introMusicRef');
        if (music && music.isPlaying) {
            music.stop();
            this.registry.remove('introMusicRef');
        }

        this.musicOwn = this.sound.add('dead', { loop: true });
        this.musicOwn.play();
		
		this.characterImages = [
            this.add.image(400, 300, 'frame').setVisible(true),
            this.add.image(400, 300, 'd4').setVisible(false)
        ];
		
        this.dialogueLines = [
            { text: "I thought I had more time. More steps to take. More paths to cross.", imageIndex: 0 },
            { text: "I never heard the lights sing. Never stood beneath the sky when it opened.", imageIndex: 0 },
            { text: "There were so many questions left unanswered. So many wonders left unseen.", imageIndex: 0 },
            { text: "We chase the stars, thinking we are infinite. But we are not.", imageIndex: 0 },
            { text: "In the end, we all return to silence. Just echoes, and the wind.", imageIndex: 0 },
            { text: "", imageIndex: 1 }
        ];

        this.currentLine = 0;
		
        this.dialogueText = this.add.text(150, 480, '', {
            fontSize: '18px',
            fill: '#ffffff',
            wordWrap: { width: 500 }
        });

        this.updateDialogue();
		
        this.input.keyboard.on('keydown-SPACE', () => {
            this.currentLine++;
            if (this.currentLine < this.dialogueLines.length) {
                this.updateDialogue();
            } else {
                if (this.musicOwn && this.musicOwn.isPlaying) {
                    this.musicOwn.stop();
                    this.registry.remove('dead');
                }
				window.location.href = "../index.html";
            }
        });

        this.input.keyboard.on('keydown-ESC', () => {
            this.scene.pause();
            this.scene.launch('PauseScene', { returnTo: this.scene.key }); // Pass the current scene's key
        });

    }

    updateDialogue() {
		const { text, imageIndex } = this.dialogueLines[this.currentLine];

        this.characterImages.forEach((img, idx) => {
            img.setVisible(idx === imageIndex);
        });

        this.dialogueText.setText(text);
    }
}