export default class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });

        this.cards = [];
        this.selectedCards = [];
        this.groupSize = 2;
        this.level = 0;
        //this.types = ['carta1', 'carta2', 'carta3', 'carta4', 'carta5', 'carta6', 'carta7', 'carta8', 'carta9', 'carta10', 'carta11', 'carta12', 'carta13', 'carta14', 'carta15', 'carta16', 'carta17', 'carta18', 'carta19', 'carta20'];
		this.types = ['carta2','carta4', 'carta6', 'carta8', 'carta10', 'carta12', 'carta14', 'carta16', 'carta18', 'carta20'];
        this.pairsLeft = 0;
        this.mode = 1;
    }

    preload() {
        this.load.image('back', '../resources2/back.png');
        //this.load.image('carta1', '../resources2/a.png');
        this.load.image('carta2', '../resources2/b.png');
        //this.load.image('carta3', '../resources2/c.png');
        this.load.image('carta4', '../resources2/d.png');
        //this.load.image('carta5', '../resources2/e.png');
        this.load.image('carta6', '../resources2/f.png');
		//this.load.image('carta7', '../resources2/g.png');
        this.load.image('carta8', '../resources2/h.png');
        //this.load.image('carta9', '../resources2/i.png');
        this.load.image('carta10', '../resources2/j.png');
        //this.load.image('carta11', '../resources2/k.png');
        this.load.image('carta12', '../resources2/l.png');
		//this.load.image('carta13', '../resources2/m.png');
        this.load.image('carta14', '../resources2/n.png');
        //this.load.image('carta15', '../resources2/o.png');
        this.load.image('carta16', '../resources2/p.png');
        //this.load.image('carta17', '../resources2/q.png');
        this.load.image('carta18', '../resources2/r.png');
		//this.load.image('carta19', '../resources2/s.png');
        this.load.image('carta20', '../resources2/t.png');
    }

    create() {
        this.mode = parseInt(localStorage.getItem('gameMode')) || 1;
        const isLoading = localStorage.getItem('isLoading') === 'true';
        const options = JSON.parse(localStorage.getItem('options')) || { groupSize: 2, numCartes: 4 };

        this.groupSize = options.groupSize || 2;
        this.numCartes = options.numCartes || 4;

        if (this.mode === 2) {
            console.log('Advanced game mode');
        } else {
            console.log('Regular game mode');
        }

        if (isLoading) {
            this.loadGame();
            localStorage.removeItem('isLoading');
        } else {
            this.startNewGame();
        }

    }

    generateBoard() {
        this.cards = [];
        this.selectedCards = [];
    
        let cardTypes = [];
    
        const numGroups = this.numCartes;

        const typesToUse = this.types.slice(0, numGroups);
    
        typesToUse.forEach(type => {
            for (let i = 0; i < this.groupSize; i++) {
                cardTypes.push(type);
            }
        });
    
        Phaser.Utils.Array.Shuffle(cardTypes);
    
        const cols = 8;
        const spacingX = 115;
        const spacingY = 140;
        const offsetX = 110;
        const offsetY = 110;
    
        for (let i = 0; i < cardTypes.length; i++) {
            const x = offsetX + (i % cols) * spacingX;
            const y = offsetY + Math.floor(i / cols) * spacingY;
    
            const card = this.add.image(x, y, cardTypes[i]).setInteractive();
            card.cardType = cardTypes[i];
            card.isFlipped = false;
    
            card.on('pointerdown', () => {
                this.flipCard(card);
            });
    
            this.cards.push(card);
        }

        this.cards.forEach((card, index) => {
            this.time.delayedCall(800 + index * 200, () => { 
                if (!card.isFlipped) {
                    card.setTexture('back');
                }
                card.isFlipped = false;
            });
        });
    
        this.pairsLeft = cardTypes.length / this.groupSize;
        console.log('Starting groups:', this.pairsLeft);
    }

    flipCard(card) {
        if (card.isFlipped || this.selectedCards.length >= this.groupSize) return;
    
        card.setTexture(card.cardType);
        card.isFlipped = true;
    
        this.selectedCards.push(card);
        console.log(this.selectedCards.length);
    
        if (this.selectedCards.length >= this.groupSize) {
            this.time.delayedCall(500, () => {
                this.checkMatch();
            });
        }
    }

    checkMatch() {
        const allMatch = this.selectedCards.every(c => c.cardType === this.selectedCards[0].cardType);
    
        if (allMatch) {
            console.log('Correct!');
            this.selectedCards.forEach(card => {
                card.disableInteractive();
            });
    
            this.pairsLeft--;
            console.log('Pairs left:', this.pairsLeft);
    
            if (this.pairsLeft <= 0) {
                if (this.mode === 2) {
					if (this.numCartes === 10) {
						console.log('You have won the game!');
						alert('You have won the game!');
						const playerName = prompt("Introduce your name:");
						if (playerName) {
							this.saveRanking(playerName, this.score);
						}
						this.time.delayedCall(1000, () => {
							window.location.href = "../index.html";
						});
					} else {
						this.nextLevel();
					}
                } else {
                    console.log('You have won the game!');
					alert('You have won the game!');
                    this.time.delayedCall(1000, () => {
                        window.location.href = "../index.html";
                    });
                }
            }
        } else {
            console.log('Error');
            this.selectedCards.forEach(card => {
                card.setTexture('back');
                card.isFlipped = false;
            });
			
			this.errors++;
			this.score -= 10;
			console.log('-10 points');
			
			if (this.score <= 0) {
				alert('You have lost the game! Saving previous level score');
				if (this.mode === 2) {
                    const playerName = prompt("Introduce your name:");
                    if (playerName) {
                        this.saveRanking(playerName, this.oldscore);
                    }
                }
				console.log('You have lost the game!');
                this.time.delayedCall(1000, () => {
                    window.location.href = "../index.html";
                });
			}
        }
    
        this.selectedCards = [];
    }
    
    nextLevel() {
        console.log('Level solved!');
        this.level++;
        this.numCartes++;
		
		if (this.level % 4 === 0) {
            this.groupSize++;
        }
		
		this.oldscore = this.score;
		this.maxScore = 50 + (this.level * 20);
		this.score = this.score + this.maxScore;

        this.clearBoard();
        this.generateBoard();
    }

    clearBoard() {
        this.cards.forEach(card => card.destroy());
        this.cards = [];
    }

    saveRanking(name, score) {
        let ranking = JSON.parse(localStorage.getItem('ranking')) || [];

        const existingPlayer = ranking.find(player => player.name === name);

        if (existingPlayer) {
            existingPlayer.score += score;
        } else {
            ranking.push({ name: name, score: score });
        }
    
        ranking.sort((a, b) => b.score - a.score);
    
        ranking = ranking.slice(0, 15);
    
        localStorage.setItem('ranking', JSON.stringify(ranking));
    }

    startNewGame() {
        const options = JSON.parse(localStorage.getItem('options')) || { groupSize: 2 };
    
        this.level = 0;
        this.groupSize = options.groupSize || 2;
        this.score = 0;
		this.oldscore = 0;
		this.maxScore = 100;
		
		this.score = this.maxScore;
    
        this.clearBoard();
        this.generateBoard();
    }

    loadGame() {
        const saveKey = (this.mode === 1) ? 'save_mode1' : 'save_mode2';
        const saveDataRaw = localStorage.getItem(saveKey);
    
        if (!saveDataRaw) {
            alert("No saved game for this mode.");
            this.startNewGame();
            return;
        }
    
        const saveData = JSON.parse(saveDataRaw);
    
        this.level = saveData.level;
        this.groupSize = saveData.groupSize;
        this.pairsLeft = saveData.pairsLeft;
        this.score = saveData.score || 0;
    
        this.clearBoard();
    
        const cols = 8;
        const spacingX = 115;
        const spacingY = 140;
        const offsetX = 110;
        const offsetY = 110;
    
        this.cards = [];
    
        for (let i = 0; i < saveData.cards.length; i++) {
            const cardData = saveData.cards[i];
            const x = offsetX + (i % cols) * spacingX;
            const y = offsetY + Math.floor(i / cols) * spacingY;
    
            const texture = cardData.isFlipped ? cardData.cardType : 'back';
            const card = this.add.image(x, y, texture).setInteractive();
            card.cardType = cardData.cardType;
            card.isFlipped = cardData.isFlipped;
    
            if (cardData.found) {
                card.disableInteractive();
            } else {
                card.on('pointerdown', () => {
                    this.flipCard(card);
                });
            }
    
            this.cards.push(card);
        }
    }

    saveGame() {
        const saveData = {
            mode: this.mode,
            level: this.level,
            groupSize: this.groupSize,
            pairsLeft: this.pairsLeft,
            cards: this.cards.map(card => ({
                cardType: card.cardType,
                isFlipped: card.isFlipped,
                found: !card.input.enabled
            })),
            score: this.score || 0
        };
    
        const saveKey = (this.mode === 1) ? 'save_mode1' : 'save_mode2';
        localStorage.setItem(saveKey, JSON.stringify(saveData));
    
        alert("Game saved!");
    }
    
    
    update() {
    }
}
