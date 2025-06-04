export class DeathScene extends Phaser.Scene {
    constructor() {
        super('DeathScene');
    }

	preload() {
        this.load.image('black', '../resources/dialog/black.png');
		this.load.image('frame', '../resources/dialog/frame.png');
        this.load.image('d4', '../resources/dialog/d4.png');
    }
	
    create() {
		this.add.image(400, 300, 'black').setOrigin(0.5); // 800x600 canvas
		
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
                //alert('Level 1 starting!');
                //this.scene.start('Level1Scene');
				//alert('No next level yet!');
				window.location.href = "../index.html";
            }
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