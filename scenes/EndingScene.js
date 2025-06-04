export class EndingScene extends Phaser.Scene {
    constructor() {
        super('EndingScene');
    }

	preload() {
        this.load.spritesheet('bgAnim', '../resources/backgrounds/bgend.png', { frameWidth: 800, frameHeight: 600});

        this.load.image('doctor', '../resources/dialog/DRdialog.png');
        this.load.image('team', '../resources/dialog/teamdialog.png');
        this.load.image('frame', '../resources/dialog/frame.png');
        this.load.image('d1', '../resources/dialog/d1.png');
        this.load.image('d2', '../resources/dialog/d2.png');
        this.load.image('d3', '../resources/dialog/d3.png');
        this.load.image('d4', '../resources/dialog/d4.png');
        this.load.image('skip', '../resources/dialog/skip.png');
        this.load.image('esc', '../resources/dialog/esc.png');

        this.load.audio('end', '../resources/audio/end.mp3');
    }
	
    create() {
		this.anims.create({
            key: 'bgLoop',
            frames: this.anims.generateFrameNumbers('bgAnim', { start: 0, end: 19 }),
            frameRate: 8, // speed of the animation
            repeat: -1 // loop forever
        });

        this.bg = this.add.sprite(400, 300, 'bgAnim').setOrigin(0.5);
        this.bg.play('bgLoop');
        this.add.image(750, 570, 'skip').setScrollFactor(0).setVisible(true);
        this.add.image(50, 570, 'esc').setScrollFactor(0).setVisible(true);

        const music = this.registry.get('introMusicRef');
        if (music && music.isPlaying) {
            music.stop();
            this.registry.remove('introMusicRef');
        }

        this.musicOwn = this.sound.add('end', { loop: true });
        this.musicOwn.play();
        this.registry.set('end', this.music);

		this.characterImages = [
            this.add.image(400, 300, 'doctor').setVisible(false),
            this.add.image(400, 300, 'team').setVisible(true),
            this.add.image(400, 300, 'frame').setVisible(false),
            this.add.image(400, 300, 'd1').setVisible(false),
            this.add.image(400, 300, 'd2').setVisible(false),
            this.add.image(400, 300, 'd3').setVisible(false),
            this.add.image(400, 300, 'd4').setVisible(false)
        ];
		
        this.dialogueLines = [
            { text: "Doctor Greenaway? You made it! We saw your signal by the ridge. Welcome to our final camp.", imageIndex: 1 },
            { text: "It wasn’t easy. I crossed frozen streams and silent valleys. But the sky above made it all worth it.", imageIndex: 0 },
            { text: "You brought most of the equipment. Without it, the magnetometers would be useless tonight. And we wouldn’t be able to record the electromagnetic frequencies we’re hoping to catch.", imageIndex: 1 },
            { text: "The Aurora should be strongest in this region. Our models suggest a rare harmonic resonance.", imageIndex: 1 },
            { text: "If we’re lucky, we won’t just see the Northern Lights. We might finally hear them sing. After all the chaos, the cold, the running - we still made it here to witness something sublime.", imageIndex: 0 },
            { text: "It’s strange, isn’t it? We chase beauty across hostile terrain, just to stand in its presence.", imageIndex: 1 },
            { text: "It’s what drives us as scientists, I suppose. The unknown calls, and we answer - even when it hurts.", imageIndex: 0 },
            { text: "And maybe, deep down, it’s also what makes us human.", imageIndex: 2 },
			{ text: "", imageIndex: 3 },
            { text: "", imageIndex: 4 },
            { text: "", imageIndex: 5 },
            { text: "", imageIndex: 6 }
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
                    this.registry.remove('end');
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