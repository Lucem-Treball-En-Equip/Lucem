# Lucem - Group Project

### Introduction
I created a 2D web-based platformer using Phaser 3, starring a doctor on a survival mission across the wild lands of Iceland. The game consists of 5 main sections:
- The introduction scene: where the player learns about their mission.
- Level 1: through the forest.
- Level 2: across the mountains.
- Level 3: over the glaciers.
- The final cutscene: where the doctor completes the mission… or dies trying.

I have created all art assets in the game to maintain visual consistency and originality. I designed three distinct background environments using Tiled and decorated them with interactive and collidable elements, such as cliffs, rocks, and icy ground, to enhance both difficulty and immersion.

Each level contains several bags of scientific equipment that the player must collect before reaching the campfire at the end of the level. The path is not safe, bear enemies roam the lands and will attack on contact, reducing the player’s hearts.

### Implementation
The implementation phase of this project involved translating the conceptual game design into a functional interactive experience using Phaser 3 and JavaScript. From the beginning, I chose to split the project into multiple JavaScript files for better readability and maintainability. Each major scene (like IntroScene, Level1Scene, PauseScene, etc.) was placed in its file.

Phaser makes scene transitions straightforward with methods like this.scene.start('sceneKey'). I used this to navigate between scenes like IntroScene, LevelScene, EndingScene, DeathScene, and PauseScene. To pass data between scenes, such as the player’s collected equipment, I used Phaser’s ability to send data as the second argument to scene.start(), then in the next scene, I accessed the data in the init() method. This method was critical for maintaining progress and implementing gameplay constraints across scenes.

Music was a key part of the game’s atmosphere. I loaded audio assets in the preload() method of the appropriate scenes and used this.sound.add() to instantiate sound objects. I then controlled playback using play(), pause(), and stop(), ensuring seamless transitions and avoiding overlapping tracks. To maintain music between scenes, I used a pattern where the music object is stored globally or passed between scenes. I also muted or resumed the music depending on the scene context.

The player character was controlled using cursor keys, implemented via this.input.keyboard.createCursorKeys() or a custom control scheme using this.input.keyboard.addKeys(). Animations were defined in the create() method using this.anims.create() and tied to player actions like moving left or jumping. In the update() method, I listened to player input and activated the appropriate animation.

One important mechanic I implemented was scene gating, meaning the player must fulfill specific objectives in one scene to unlock the next. For example, in the "Level1Scene" scene, the player must collect all the equipment, although killing the bears is not a requirement.

To allow the player to pause the game, I created a separate PauseScene that could be triggered with a key press (like ESC).

### Conclusions
Working on this project with Phaser and JavaScript has been both a technically enriching and creatively challenging experience. I learned a great deal about structuring game logic using scenes, managing state across transitions, and implementing gameplay mechanics like player movement, animation, and scene gating.

However, the implementation process wasn’t without its challenges. One of the most persistent issues I faced was with certain animations, specifically the attack, crawl-attack, and death animations. Even though I defined and triggered them like the others, they fail to play at runtime. I tried various methods such as manually stopping current animations, adjusting frame rates, or tweaking the animation event listeners, but in the end, I couldn't resolve this problem.

Another issue involved the bear enemy spritesheets. My original plan was to include three differently colored bear enemies, but for reasons I couldn’t identify, only one color consistently appears in the game. I suspect it might be a problem with how the spritesheet is being loaded or how the frames are being referenced, but despite several attempts at debugging it, the issue remained unresolved.

Additionally, I struggled with making the player’s movement and jumping feel smooth and elegant. I experimented with velocity settings, gravity tweaks, and different physics bodies, but I never reached a result that felt satisfying. In the end, I opted for a functional but stiff implementation.

Despite these obstacles, I was able to complete the core gameplay loop: the player can explore scenes, collect necessary items, trigger animations (in most cases), and progress through the game narrative. The pause system works reliably, and I successfully implemented transitions between scenes using both logic conditions and data passing. Overall, I’m proud of how much I’ve learned and built on my own.

## User Manual
### Controls
**Movement**
- ← / →: Move left/right
- ↑: Jump
- ↓: Crouch (hold)

**Actions**
- E: Attack (when standing)
- ↓ + E: Crawl attack (while crouching)
- Q: Go to the next scene (while standing near the fire)

**Menu and Pause**

- ESC: Pause/unpause the game
- SPACE: Progress dialogue

### Gameplay Notes
- To progress to the next scene, you must collect all required equipment in the current scene.
- Controls and actions are explained in the Introduction Scene
- Pause icons appear in every scene to indicate the pausing ability
- The audio volume is constant and has to be modified on the device


Natalya Golembyovska
