export class IntroScene extends Phaser.Scene {
    constructor() {
        super('IntroScene');
    }

	preload() {
		this.load.image('bg', '../resources/backgrounds/bg.png');
        this.load.image('doctor', '../resources/dialog/DRdialog.png');
        this.load.image('team', '../resources/dialog/teamdialog.png');
        this.load.image('skip', '../resources/dialog/skip.png');
        this.load.image('esc', '../resources/dialog/esc.png');

        this.load.audio('introMusic', '../resources/audio/level.mp3');
    }
	
    create() {
		this.add.image(400, 300, 'bg').setOrigin(0.5); // 800x600 canvas
        this.add.image(750, 570, 'skip').setScrollFactor(0).setVisible(true);
        this.add.image(50, 570, 'esc').setScrollFactor(0).setVisible(true);

        this.music = this.sound.add('introMusic', { loop: true });
        this.music.play();
        this.registry.set('introMusicRef', this.music);
		
		this.characterImages = [
            this.add.image(400, 300, 'doctor').setVisible(true),
            this.add.image(400, 300, 'team').setVisible(false)
        ];
		
        this.dialogueLines = [
            { text: "Doctor Greenaway? This is Doctor Bjornson form Rangá Observatory. Do you copy? Over.", imageIndex: 0 },
            { text: "Affirmative. Although the signal is bad out here. Are you ready to join my team for the expedition? Over.", imageIndex: 1 },
            { text: "Affirmative. Do you need any additional equipment from the Observatory? Over.", imageIndex: 0 },
            { text: "Negative, Doctor. We had all the supplies we needed but on our way to the observation point our team had to flee local bears. A few of the assistants dropped their bags with gear, equipment and food.", imageIndex: 1 },
			{ text: "I remember that you are experienced in bear encounters so we hope that you could collect our lost gear on your way to us. Or the expedition will have to be cut short. Over.", imageIndex: 1 },
            { text: "Copy that. I am too excited to hear the Aurora song so I will help you. How did your team move through the forest and what is your position, Doctor Greenaway? Over.", imageIndex: 0 },
            { text: "We are camping near the Vatnajökull Glacier. You will be able to follow our path by our campfires [Q]. We had to run all around, left [←] and right [→], jump on the bushes [↑] and sneak under the rocks [↓].", imageIndex: 1 },
            { text: "Our physicist had to protect us from the bears with his pickaxe [E] but we were able to take a pause and rest time from time [ESC]. I hope you find us soon, Doctor, wouldn't want to miss this show. Out.", imageIndex: 1 }
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
                //alert('Level 1 starting!');
                this.scene.start('Level1Scene');
				//alert('No next level yet!');
				//window.location.href = "../index.html";
            }
        });

        this.input.keyboard.on('keydown-ESC', () => {
            this.scene.pause();
            this.scene.launch('PauseScene', { returnTo: this.scene.key });
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