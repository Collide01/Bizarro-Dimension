"use strict";
const app = new PIXI.Application({
    width: 600,
    height: 600
});
document.body.appendChild(app.view);

// constants
const sceneWidth = app.view.width;
const sceneHeight = app.view.height;

// aliases
let stage;

// game variables
// scenes
let preTitleScene, startScene, storyScene, helpScene, gameScene, clearScene, gameOverScene, completeScene;
// sprites and labels
let logo, cannon, cannonHitbox, healthBar, bossBizarro, bossImage, charge, beam, snap,
    octopusTexture, crabTexture, squidTexture, laserTexture, alienExplosionTexture, playerExplosionTexture, barrierDestructionTexture, bossBizarroTexture, healthBarTexture, chargeTexture, steamStartTexture, steamLoopTexture,
    storyLabel, helpLevelLabel, helpLevelTitle, helpLabel, levelLabel, livesLabel, scoreLabel, currentScoreLabel, gameOverScoreLabel, finalScoreLabel, bossLabel, oneUpLabel;
// audio
let playerShootSound, enemyShootSound, hitPlayerSound, hitEnemySound, click, spiritGun, beamSound, trainWhistle, glassBreak, thunder1, thunder2, fingerSnap, 
    titleTheme, mercuryStart, mercuryLoop, merryGoRound, pizzaTime, mitsuo, gameSong, suspendedDoll, beepBlock, infiniteBlue, freezeFlame;
// player movement variables
let up, down, left, right, fire, enter;
// variables that can be instantiated at the start
let sounds = [];
let barriers = [];
let aliens = [];
let playerLasers = [];
let alienLasers = [];
let explosions = [];
// the following six arrays are used for circular movement for the aliens
let angles = [];
let radii = [];
let direction = [];
let speed = [];
let alienLaserDirectionX = [];
let alienLaserDirectionY = [];
let score = 0;
let lives = 5;
let level = 1;
let oneUpMilestone = 10000;
let paused = true;
let verticalAllowed = false; // determines if the player can move up or down
let alienMovement = false; // false = left; true = right;
let currentlyDead = false;
let respawn = false;
let respawnInvincibility = 0; // timer for respawn invincibility
let randomLevel = 99;
/*
List of Random levels:
0 = The Carousel Crew (Will have a significantly higher chance of appearing)
1 = Red Light, Green Light
2 = Motor Overload
3 = Hijack
4 = C-C-C-Cold Chaos
5 = Dark Destruction
6 = DANGER! (Will have a significantly smaller chance of appearing)
99 = default (used for the first level and the last level because those aren't randomized)
*/
let completedRandomLevels = [0, 0, 0, 0, 0, 0, 0]; // each number represents a random level. Once it's completed, it turns into a 1.
// the following variables are used for specific levels
let aliensCanMove = true; // Red Light, Green Light; chooses whether the player can move or the aliens can move.
let switchTimer = 0;
let snapNumber = 1;
let randomSize = 0; // Motor Overload and C-C-C-Cold Chaos; chooses random sizes for the aliens
/*
Random sizes:
0 = x0.5
1 = x1 (default)
2 = x1.5
*/
let globalVX = 0; // Hijack; Aliens move with you
let globalVY = 0;
let reverseMovement = false;
let lightningStrike = false; // Dark Destruction; used to simulate thunder for temporary lighting
let lightningTimer = 0;
let thunderSFX = 1;
// the following variables and arrays are used specifically for the boss battle
let bossElements = [];
let bossHealth = 300;
let bossDefeated = false;
let gotAngry = false;
let steamyTimer = 0; // the boss emits a fume of steam out of his head in anger for a set amount of time once he hits below 150 health
let steamFumes = [];
let bossDies = false; // makes the boss explode when he dies
let deathTimer = 0;
let deathExplosions = 0;
let currentlyPerformingAttack = false;
let timeUntilNextAttack = Math.random() + Math.floor((Math.random() * 2)) + 2.5;
let attackTimer = 0; // used to time charges, durations of attacks, etc.
let healthAtStart = bossHealth; // used to tell the boss's health at the start of the attack
let chargeHealth = 15;
let beamMoving = false;
let ailmentTimer = 0; // time until status ailment inflicted on player wears off
let currentAttack = 0;
/*
List of possible boss attacks
0 = charges for a bit, then fires three lasers
1 = charges for a while, then fires a beam that guarantees player death. Charge can be interrupted and stopped
2 = inflicts random status ailment. Ailments are shown from cannon color 
and go away after certain amount of time or if player dies
    red = can't move, but can still shoot (6 seconds)
    orange = move faster (9 seconds)
    yellow = controls are reversed (8 seconds)
    blue = move slower (9 seconds)
    black = invisible, this includes lasers (10 seconds)
    pink = lasers heal Boss Bizarro (4 seconds)
*/

// Initializes everything in the game and makes the scenes work
function setup() {
    stage = app.stage;

    // Create the `pre-title` scene
    preTitleScene = new PIXI.Container();
    stage.addChild(preTitleScene);

    // Create the `start` scene and make it invisible
    startScene = new PIXI.Container();
    startScene.visible = false;
    stage.addChild(startScene);

    // Create the `story` scene and make it invisible
    storyScene = new PIXI.Container();
    storyScene.visible = false;
    stage.addChild(storyScene);

    // Create the `help` scene and make it invisible
    helpScene = new PIXI.Container();
    helpScene.visible = false;
    stage.addChild(helpScene);

    // Create the main `game` scene and make it invisible
    gameScene = new PIXI.Container();
    gameScene.visible = false;
    gameScene.sortableChildren = true;
    stage.addChild(gameScene);

    // Create the `clear` scene and make it invisible
    clearScene = new PIXI.Container();
    clearScene.visible = false;
    stage.addChild(clearScene);

    // Create the `gameOver` scene and make it invisible
    gameOverScene = new PIXI.Container();
    gameOverScene.visible = false;
    stage.addChild(gameOverScene);

    // Create the `complete` scene and make it invisible
    completeScene = new PIXI.Container();
    completeScene.visible = false;
    stage.addChild(completeScene);

    // Load images that will appear in scenes before the game scene
    logo = new Logo();
    bossBizarroTexture = loadBossBizarro();

    // Create labels for all 8 scenes
    createLabelsAndButtons();
    function createLabelsAndButtons() {
        let buttonStyle = new PIXI.TextStyle({
            fill: 0x000000,
            fontSize: 48,
            fontFamily: "Press Start 2P",
            stroke: 0xFFFFFF,
            strokeThickness: 5,
            border: "5px solid white"
        });

        // set up `preTitleScene`
        // make the start game button
        let startGameButton = new PIXI.Text("START THE\nGAME!");
        startGameButton.style = buttonStyle;
        startGameButton.style.align = "center";
        startGameButton.x = 80;
        startGameButton.y = 250;
        startGameButton.interactive = true;
        startGameButton.buttonMode = true;
        startGameButton.on("pointerup", startGame); // startGame is a function reference
        startGameButton.on('pointerover', e => e.target.alpha = 0.7); // concise arrow function with no brackets
        startGameButton.on('pointerout', e => e.currentTarget.alpha = 1.0); // ditto
        preTitleScene.addChild(startGameButton);

        // make the info label
        let infoLabel = new PIXI.Text("(Click or press Enter)");
        infoLabel.style = new PIXI.TextStyle({
            fill: 0xFFFFFF,
            fontSize: 27,
            fontFamily: "Press Start 2P",
        });
        infoLabel.x = 0;
        infoLabel.y = 350;
        preTitleScene.addChild(infoLabel);

        // set up `startScene`
        // make the title
        let startLabel1 = logo;
        startLabel1.x = 300;
        startLabel1.y = 150;
        startLabel1.width = 600;
        startLabel1.height = 300;
        startScene.addChild(startLabel1);

        // make the subtitle
        let startLabel2 = new PIXI.Text("\nThe Bizarro\n Dimension");
        startLabel2.style = new PIXI.TextStyle({
            fill: 0xFFE744,
            fontSize: 49,
            fontFamily: "Press Start 2P",
            stroke: 0x000000,
            strokeThickness: 5,
            dropShadow: true,
            dropShadowAngle: -Math.PI / 2,
            dropShadowColor: 0xF12C0B,
            dropShadowDistance: 8
        });
        startLabel2.x = 30;
        startLabel2.y = 260;
        startScene.addChild(startLabel2);

        // make the start game button
        let startButton = new PIXI.Text("START");
        startButton.style = buttonStyle;
        startButton.x = 175;
        startButton.y = sceneHeight - 100;
        startButton.interactive = true;
        startButton.buttonMode = true;
        startButton.on("pointerup", startGame); // startGame is a function reference
        startButton.on('pointerover', e => e.target.alpha = 0.7); // concise arrow function with no brackets
        startButton.on('pointerout', e => e.currentTarget.alpha = 1.0); // ditto
        startScene.addChild(startButton);

        // set up `storyScene`
        // place Boss Bizarro onto the scene to make it seem like he's talking
        bossImage = new PIXI.Sprite(bossBizarroTexture[0]);
        bossImage.anchor.set(.5, .5); // position, scaling, rotating etc are now from center of sprite
        bossImage.x = 300;
        bossImage.y = 130;
        bossImage.tint = 0xFF00CC;
        storyScene.addChild(bossImage);

        // make text
        storyLabel = new PIXI.Text();
        storyLabel.style = new PIXI.TextStyle({
            fill: 0xFFFFFF,
            fontSize: 20,
            fontFamily: "Press Start 2P",
            align: "center",
            leading: 5
        });
        storyLabel.x = 10;
        storyLabel.y = 260;
        storyScene.addChild(storyLabel);
        changeStoryText();

        // make the next button
        let nextButton = new PIXI.Text("NEXT");
        nextButton.style = buttonStyle;
        nextButton.x = 200;
        nextButton.y = sceneHeight - 100;
        nextButton.interactive = true;
        nextButton.buttonMode = true;
        nextButton.on("pointerup", startGame); // startGame is a function reference
        nextButton.on('pointerover', e => e.target.alpha = 0.7); // concise arrow function with no brackets
        nextButton.on('pointerout', e => e.currentTarget.alpha = 1.0); // ditto
        storyScene.addChild(nextButton);

        // set up `helpScene`
        // make level text
        helpLevelLabel = new PIXI.Text();
        helpLevelLabel.style = new PIXI.TextStyle({
            fill: 0xFFE744,
            fontSize: 80,
            fontFamily: "Press Start 2P",
            stroke: 0x000000,
            strokeThickness: 5,
            dropShadow: true,
            dropShadowAngle: -Math.PI / 2,
            dropShadowColor: 0xF12C0B,
            dropShadowDistance: 8
        });
        helpLevelLabel.x = 14;
        helpLevelLabel.y = -60;
        helpScene.addChild(helpLevelLabel);

        // make level title
        helpLevelTitle = new PIXI.Text();
        helpLevelTitle.style = new PIXI.TextStyle({
            fill: 0x000000,
            fontSize: 27,
            fontFamily: "Press Start 2P",
            stroke: 0xFFFFFF,
            strokeThickness: 5
        });
        helpLevelTitle.x = 40;
        helpLevelTitle.y = 125;
        helpScene.addChild(helpLevelTitle);

        // make help label
        helpLabel = new PIXI.Text();
        helpLabel.style = new PIXI.TextStyle({
            fill: 0xFFFFFF,
            fontSize: 20,
            fontFamily: "Press Start 2P",
            align: "center",
            leading: 5
        });
        helpLabel.x = 10;
        helpLabel.y = 180;
        helpScene.addChild(helpLabel);
        changeHelpText();

        // make the begin button
        let beginButton = new PIXI.Text("BEGIN");
        beginButton.style = buttonStyle;
        beginButton.x = 180;
        beginButton.y = sceneHeight - 100;
        beginButton.interactive = true;
        beginButton.buttonMode = true;
        beginButton.on("pointerup", startGame); // startGame is a function reference
        beginButton.on('pointerover', e => e.target.alpha = 0.7); // concise arrow function with no brackets
        beginButton.on('pointerout', e => e.currentTarget.alpha = 1.0); // ditto
        helpScene.addChild(beginButton);

        // set up `gameScene`
        let textStyle = new PIXI.TextStyle({
            fill: 0xFFFFFF,
            fontSize: 20,
            fontFamily: "Press Start 2P",
        });

        // make score label
        scoreLabel = new PIXI.Text();
        scoreLabel.style = textStyle;
        scoreLabel.x = 5;
        scoreLabel.y = 5;
        gameScene.addChild(scoreLabel);
        increaseScoreBy(0);

        // make life label
        livesLabel = new PIXI.Text();
        livesLabel.style = textStyle;
        livesLabel.x = 450;
        livesLabel.y = 5;
        gameScene.addChild(livesLabel);
        decreaseLivesBy(0);

        // make level label
        levelLabel = new PIXI.Text();
        levelLabel.style = textStyle;
        levelLabel.x = 250;
        levelLabel.y = 5;
        gameScene.addChild(levelLabel);
        increaseLevelBy(0);

        // set up `gameOverScene`
        // make game over text
        let gameOverText = new PIXI.Text("\nGame\nOver!");
        textStyle = new PIXI.TextStyle({
            fill: 0xFFE744,
            fontSize: 90,
            fontFamily: "Press Start 2P",
            stroke: 0x000000,
            strokeThickness: 5,
            dropShadow: true,
            dropShadowAngle: -Math.PI / 2,
            dropShadowColor: 0xF12C0B,
            dropShadowDistance: 8
        });
        gameOverText.style = textStyle;
        gameOverText.x = 80;
        gameOverText.y = -10;
        gameOverScene.addChild(gameOverText);

        // make "play again?" button
        let playAgainButton = new PIXI.Text("Try Again?");
        playAgainButton.style = buttonStyle;
        playAgainButton.x = 55;
        playAgainButton.y = sceneHeight - 100;
        playAgainButton.interactive = true;
        playAgainButton.buttonMode = true;
        playAgainButton.on("pointerup", startGame); // startGame is a function reference
        playAgainButton.on('pointerover', e => e.target.alpha = 0.7); // concise arrow function with no brackets
        playAgainButton.on('pointerout', e => e.currentTarget.alpha = 1.0); // ditto
        gameOverScene.addChild(playAgainButton);

        // intialize gameOverScoreLabel
        gameOverScoreLabel = new PIXI.Text();
        textStyle = new PIXI.TextStyle({
            fill: 0xFFFFFF,
            fontSize: 27,
            fontFamily: "Press Start 2P",
            align: "center"
        });
        gameOverScoreLabel.style = textStyle;
        gameOverScoreLabel.x = 80;
        gameOverScoreLabel.y = 350;
        gameOverScene.addChild(gameOverScoreLabel);

        // set up `clearScene`
        // make clear text
        let clearText = new PIXI.Text("\nCLEAR!");
        textStyle = new PIXI.TextStyle({
            fill: 0xFFE744,
            fontSize: 90,
            fontFamily: "Press Start 2P",
            stroke: 0x000000,
            strokeThickness: 5,
            dropShadow: true,
            dropShadowAngle: -Math.PI / 2,
            dropShadowColor: 0xF12C0B,
            dropShadowDistance: 8
        });
        clearText.style = textStyle;
        clearText.x = 43;
        clearText.y = -40;
        clearScene.addChild(clearText);

        // intialize currentScoreLabel
        currentScoreLabel = new PIXI.Text();
        textStyle = new PIXI.TextStyle({
            fill: 0xFFFFFF,
            fontSize: 27,
            fontFamily: "Press Start 2P",
            align: "center"
        });
        currentScoreLabel.style = textStyle;
        currentScoreLabel.x = 45;
        currentScoreLabel.y = 280;
        clearScene.addChild(currentScoreLabel);

        // make "next" button
        let clearNextButton = new PIXI.Text("NEXT");
        clearNextButton.style = buttonStyle;
        clearNextButton.x = 200;
        clearNextButton.y = sceneHeight - 100;
        clearNextButton.interactive = true;
        clearNextButton.buttonMode = true;
        clearNextButton.on("pointerup", startGame); // startGame is a function reference
        clearNextButton.on('pointerover', e => e.target.alpha = 0.7); // concise arrow function with no brackets
        clearNextButton.on('pointerout', e => e.currentTarget.alpha = 1.0); // ditto
        clearScene.addChild(clearNextButton);

        //set up `completeScene`
        // make headline
        let headline = new PIXI.Text("\nCONGRATS!");
        headline.style = new PIXI.TextStyle({
            fill: 0xFFE744,
            fontSize: 67,
            fontFamily: "Press Start 2P",
            stroke: 0x000000,
            strokeThickness: 5,
            dropShadow: true,
            dropShadowAngle: -Math.PI / 2,
            dropShadowColor: 0xF12C0B,
            dropShadowDistance: 8
        });
        headline.x = 10;
        headline.y = -57;
        completeScene.addChild(headline);

        // make help label
        let completeLabel = new PIXI.Text("You defeated Boss\nBizarro and returned\nhome safely! Now\nEarth is in safe\nhands once again!");
        completeLabel.style = new PIXI.TextStyle({
            fill: 0xFFFFFF,
            fontSize: 27,
            fontFamily: "Press Start 2P",
            align: "center",
            leading: 5
        });
        completeLabel.x = 30;
        completeLabel.y = 130;
        completeScene.addChild(completeLabel);

        // intialize finalScoreLabel
        finalScoreLabel = new PIXI.Text();
        textStyle = new PIXI.TextStyle({
            fill: 0xFFFFFF,
            fontSize: 27,
            fontFamily: "Press Start 2P",
            align: "center"
        });
        finalScoreLabel.style = textStyle;
        finalScoreLabel.x = 80;
        finalScoreLabel.y = 350;
        completeScene.addChild(finalScoreLabel);
    }

    // Load cannon
    cannon = new Cannon();
    gameScene.addChild(cannon);
    cannonHitbox = new CannonHitbox();
    cannonHitbox.width = cannon.width;
    cannonHitbox.height = cannon.height - 13;
    gameScene.addChild(cannonHitbox);

    // Load Audio
    // sound effects
    playerShootSound = new Howl({
        src: ['audio/playerShoot.wav'],
        volume: 0.1
    });
    sounds.push(playerShootSound);
    hitPlayerSound = new Howl({
        src: ['audio/playerExplosion.wav'],
        volume: 0.5
    });
    sounds.push(hitPlayerSound);
    enemyShootSound = new Howl({
        src: ['audio/alienShoot.wav'],
        volume: 0.6
    });
    sounds.push(enemyShootSound);
    hitEnemySound = new Howl({
        src: ['audio/alienKilled.wav'],
        volume: 0.1
    });
    click = new Howl({
        src: ['audio/click.wav']
    });
    sounds.push(click);
    spiritGun = new Howl({
        src: ['audio/spirit_gun.wav'],
        loop: true
    });
    sounds.push(spiritGun);
    beamSound = new Howl({
        src: ['audio/beam.wav']
    });
    sounds.push(beamSound);
    trainWhistle = new Howl({
        src: ['audio/train_whistle.wav']
    });
    sounds.push(trainWhistle);
    glassBreak = new Howl({
        src: ['audio/glass_break.wav']
    });
    sounds.push(glassBreak);
    thunder1 = new Howl({
        src: ['audio/thunder1.wav'],
        volume: 0.5
    });
    sounds.push(thunder1);
    thunder2 = new Howl({
        src: ['audio/thunder2.wav'],
        volume: 0.5
    });
    sounds.push(thunder2);
    fingerSnap = new Howl({
        src: ['audio/fingerSnap.wav']
    });
    sounds.push(fingerSnap);

    // music
    titleTheme = new Howl({
        src: ['audio/title_screen.wav'],
        loop: true
    });
    sounds.push(titleTheme);
    mercuryStart = new Howl({
        src: ['audio/mercury_start.wav'],
        onend: function () {
            mercuryLoop.play();
        }
    });
    sounds.push(mercuryStart);
    mercuryLoop = new Howl({
        src: ['audio/mercury_loop.wav'],
        loop: true
    });
    sounds.push(mercuryLoop);
    merryGoRound = new Howl({
        src: ['audio/merry_go_round.wav'],
        loop: true
    });
    sounds.push(merryGoRound);
    pizzaTime = new Howl({
        src: ['audio/pizza_time.wav'],
        loop: true
    });
    sounds.push(pizzaTime);
    mitsuo = new Howl({
        src: ['audio/revelations_mitsuo.wav'],
        loop: true
    });
    sounds.push(mitsuo);
    gameSong = new Howl({
        src: ['audio/game.wav'],
        loop: true
    });
    sounds.push(gameSong);
    suspendedDoll = new Howl({
        src: ['audio/suspended_doll.wav'],
        loop: true
    });
    sounds.push(suspendedDoll);
    beepBlock = new Howl({
        src: ['audio/beep_block.wav'],
        loop: true,
        volume: 0.7
    });
    sounds.push(beepBlock);
    infiniteBlue = new Howl({
        src: ['audio/infinite_blue.wav'],
        loop: true
    });
    sounds.push(infiniteBlue);
    freezeFlame = new Howl({
        src: ['audio/freezeflame.wav'],
        loop: true
    });
    sounds.push(freezeFlame);

    // Load spritesheets and still sprites for game scene
    octopusTexture = loadOctopus();
    crabTexture = loadCrabs();
    squidTexture = loadSquids();
    laserTexture = loadAlienLasers();
    alienExplosionTexture = loadAlienExplosions();
    playerExplosionTexture = loadPlayerExplosions();
    barrierDestructionTexture = loadBarrierDestruction();
    healthBarTexture = loadHealthBar();
    chargeTexture = loadCharge();
    beam = new Beam();
    snap = new SnapEffect();
    oneUpLabel = new PIXI.Text("1UP");
    oneUpLabel.style = new PIXI.TextStyle({
        fill: 0xFFE744,
        fontSize: 27,
        fontFamily: "Press Start 2P",
        stroke: 0xF12C0B,
        strokeThickness: 5
    });
    steamStartTexture = loadSteam();
    steamLoopTexture = loadSteamLoop();
    oneUpLabel.x = -100;

    // Start update loop
    app.ticker.add(gameLoop);

    // Start listening for key press events on the canvas
    left = keyboard("ArrowLeft");
    up = keyboard("ArrowUp");
    right = keyboard("ArrowRight");
    down = keyboard("ArrowDown");
    fire = keyboard(" ");
    enter = keyboard("Enter");
    //Left
    left.press = () => {
        cannon.vx = -5;
    };
    left.release = () => {
        if (!right.isDown) {
            cannon.vx = 0;
        }
        else {
            cannon.vx = 5;
        }
    };
    //Right
    right.press = () => {
        cannon.vx = 5;
    };
    right.release = () => {
        if (!left.isDown) {
            cannon.vx = 0;
        }
        else {
            cannon.vx = -5;
        }
    };
    //Up
    up.press = () => {
        cannon.vy = -5;
    };
    up.release = () => {
        if (!down.isDown) {
            cannon.vy = 0;
        }
        else {
            cannon.vy = 5;
        }
    };
    //Down
    down.press = () => {
        cannon.vy = 5;
    };
    down.release = () => {
        if (!up.isDown) {
            cannon.vy = 0;
        }
        else {
            cannon.vy = -5;
        }
    };
    //Space
    fire.press = () => {
        fireLaser();
    };
    //Enter
    enter.press = () => {
        if (gameScene.visible == false) {
            startGame();
        }
    };

    // Now our `preTitleScene` is visible
    // Clicking the menu buttons calls startGame()
    // Each scene takes you to different scenes
    function startGame() {
        if (preTitleScene.visible == true) {
            titleTheme.play();
            preTitleScene.visible = false;
            startScene.visible = true;
        }
        else if (startScene.visible == true || gameOverScene.visible == true || clearScene.visible == true) {
            titleTheme.stop();
            if (level == 8) {
                startScene.visible = false;
                gameOverScene.visible = false;
                clearScene.visible = false;
                completeScene.visible = true;
            }
            else {
                startScene.visible = false;
                storyScene.visible = true;
                gameOverScene.visible = false;
                clearScene.visible = false;
            }
        }
        else if (storyScene.visible == true) {
            storyScene.visible = false;
            helpScene.visible = true;
        }
        else if (helpScene.visible == true) {
            helpScene.visible = false;
            gameScene.visible = true;
            increaseScoreBy(0);
            decreaseLivesBy(0);
            increaseLevelBy(0);
            loadLevel();
        }
    }
}

// increases the score
function increaseScoreBy(value) {
    score += value;
    scoreLabel.text = `Score ${score}`;
}

// decreases the number of lives
function decreaseLivesBy(value) {
    lives -= value;
    lives = parseInt(lives);
    livesLabel.text = `Lives ${lives}`;
}

// increases the level number
function increaseLevelBy(value) {
    level += value;
    levelLabel.text = `Level ${level}`;
}

// changes the text in storyScene according to the current level
function changeStoryText() {
    if (level == 1) {
        storyLabel.text = `Hehehe. I am Boss Bizarro,\nthe ruler of this dimension.\nNow that we pulled you here,\nwe'll be sure to get rid of\nyou so there won't be anyone\nleft to defend Earth! Get 'em\nboys!`;
    }
    if (randomLevel == 0) {
        storyLabel.text = `Hmph. So you can put up a\nfight. Very well then. Send\nout the next wave!`;
        storyLabel.x = 40;
    }
    if (randomLevel == 1) {
        storyLabel.text = `So you like your little\ncannon so much, don't you?\nWell how do you like it if it\ncan't move anymore?!`;
        storyLabel.x = 10;
    }
    if (randomLevel == 2) {
        storyLabel.text = `Hmmm... I'm curious. Are you\nhumans capable of traveling\nat the speed of light? Let's\nadjust your cannon and find\nout.`;
        storyLabel.x = 20;
    }
    if (randomLevel == 3) {
        storyLabel.text = `Hehehe. Are you ready? This\ntrick is gonna mess with your\nhead. Let's swap those arrow\nkeys on your keyboard.`;
        storyLabel.x = 10;
    }
    if (randomLevel == 4) {
        storyLabel.text = `Hey! I just thought of a new\ntrick! Watch this!\n\n*fwoosh*\n\nOh. Your cannon is frozen\nnow. Cool!`;
        storyLabel.x = 20;
    }
    if (randomLevel == 5) {
        storyLabel.text = `Hm? What is this thing? A\nsun? What if I just...\n\n*pop*`;
        storyLabel.x = 50;
    }
    if (randomLevel == 6) {
        storyLabel.text = `Uh oh. Now you've done it.\nYou've angered them...\nWell have fun while you can!\nBecause I can guarantee you\nwon't survive this one!`;
        storyLabel.x = 22;
    }
    if (level == 7) {
        if (completedRandomLevels[6] == 0) {
            storyLabel.text = `Alright. I think I've seen\nenough.\nI was hoping it wouldn't come\nto this. Now I must show you\nat least 2% of my power!`;
            storyLabel.x = 10;
        }
        else if (completedRandomLevels[6] == 1) {
            storyLabel.text = `WHAT?! You even beat the\nElite Hotheads?!\nI was hoping it wouldn't come\nto this. Now I must show you\nat least 2% of my power!`;
            storyLabel.x = 10;
        }
    }
}

// changes the text in helpScene according to the current level
function changeHelpText() {
    helpLevelLabel.text = `\nLevel ${level}`;
    if (level == 1) {
        helpLevelTitle.text = `\nJust Like Old Times`;
        defaultStyle();
        helpLevelTitle.x = 40;
        helpLabel.style.leading = 0;
        helpLabel.text = `Use the left and right arrow\nkeys to move. Press Space to\nfire lasers and defeat the\naliens.
            \nEvery 10000 points gets you a\n1UP.
            \nAliens are normally white,\nbut some are different\ncolors. Yellow ones fire\nlasers more frequently and\nblue ones take more than one\nhit to go down.`;
        helpLabel.x = 10;
        helpLabel.y = 180;
    }
    if (randomLevel == 0) {
        helpLevelTitle.text = `\nThe Carousel Crew`;
        defaultStyle();
        helpLevelTitle.x = 60;
        helpLabel.text = `In this level, you can also\nuse the up and down arrows to\nmove.
            \nRed aliens are very rare.\nThey have the properties of\nyellow and blue aliens,\nmaking them extremely\ndangerous.`;
        helpLabel.x = 10;
    }
    if (randomLevel == 1) {
        helpLevelTitle.text = `\nRed Light, Green Light`;
        defaultStyle();
        helpLevelTitle.x = 3;
        helpLabel.text = `When the cannon turns red,\nyou can't move. However, you\ncan still shoot, so you're\nnot completely helpless.`;
        helpLabel.x = 20;
    }
    if (randomLevel == 2) {
        helpLevelTitle.text = `\nMotor Overload`;
        defaultStyle();
        helpLevelTitle.x = 102;
        helpLabel.text = `When the cannon turns orange,\nyou move extremely fast.\nBecause of how fast you are\ngoing, it can be hard to aim\nprecisely and it's easy to\nrun into hazards. However,\nit's also easy to dodge them\nif they're flying at you.`;
        helpLabel.x = 10;
    }
    if (randomLevel == 3) {
        helpLevelTitle.text = `\nHijack`;
        defaultStyle();
        helpLevelTitle.x = 205;
        helpLabel.text = `In this level, you can also\nuse the up and down arrows to\nmove.
            \nWhen the cannon turns yellow,\nyour controls are reversed.\nLeft becomes right and right\nbecomes left. Same thing\napplies to vertical movement.`;
        helpLabel.x = 10;
    }
    if (randomLevel == 4) {
        helpLevelTitle.text = `\nC-C-C-Cold Chaos`;
        defaultStyle();
        helpLevelTitle.x = 72;
        helpLabel.text = `When the cannon turns blue,\nyou move extremely slow.\nIt makes aiming precisely\neasier, but it also makes it\nmuch harder to avoid incoming\nfire.`;
        helpLabel.x = 10;
    }
    if (randomLevel == 5) {
        helpLevelTitle.text = `\nDark Destruction`;
        defaultStyle();
        helpLevelTitle.x = 74;
        helpLabel.text = `It's very dark in this level,\nso you're essentially\ninvisible.\nYour lasers are also\n invisible, making it\ndifficult to tell where you're\nshooting from. Make sure you\ndon't lose track of where you\nare!`;
        helpLabel.x = 10;
    }
    if (randomLevel == 6) {
        helpLevelTitle.text = `DANGER!`;
        helpLevelTitle.style.fill = 0xFF0000;
        helpLevelTitle.style.fontSize = 88;
        helpLevelTitle.style.fontFamily = "Press Start 2P";
        helpLevelTitle.style.stroke = 0x000000;
        helpLevelTitle.style.strokeThickness = 0;
        helpLevelTitle.style.dropShadow = false;
        helpLevelTitle.x = 10;
        helpLevelTitle.y = 125;
        helpLabel.text = `If you beat this level, you\nwill get a massive point\nbonus and instantly go to the\nboss battle. Good luck!`;
        helpLabel.x = 10;
        helpLabel.y = 230;
    }
    if (level == 7) {
        helpLevelTitle.text = `BOSS\nBATTLE`;
        helpLevelTitle.style.align = 'center';
        helpLevelTitle.style.fill = 0xFF00CC;
        helpLevelTitle.style.fontSize = 98;
        helpLevelTitle.style.fontFamily = "Press Start 2P";
        helpLevelTitle.style.stroke = 0xFFFFFF;
        helpLevelTitle.style.strokeThickness = 5;
        helpLevelTitle.style.dropShadow = false;
        helpLevelTitle.x = 10;
        helpLevelTitle.y = 125;
        helpLabel.text = ``;
    }

    // the default title style and helpLabel position
    function defaultStyle() {
        helpLevelTitle.style.fill = 0xFFE744;
        helpLevelTitle.style.fontSize = 27;
        helpLevelTitle.style.fontFamily = "Press Start 2P";
        helpLevelTitle.style.stroke = 0x000000;
        helpLevelTitle.style.strokeThickness = 5;
        helpLevelTitle.style.dropShadow = true;
        helpLevelTitle.style.dropShadowAngle = -Math.PI / 2;
        helpLevelTitle.style.dropShadowColor = 0xF12C0B;
        helpLevelTitle.style.dropShadowDistance = 4;
        helpLabel.style.leading = 5;
        helpLevelTitle.y = 98;
    }
}

// game loop
function gameLoop() {
    if (paused) return;

    // Calculate "delta time"
    let dt = 1 / app.ticker.FPS;
    if (dt > 1 / 12) dt = 1 / 12;

    // If the score is or goes over a multiple of 10000, grant a 1UP
    if (score >= oneUpMilestone) {
        lives += 2;
        decreaseLivesBy(1);
        increaseScoreBy(100);
        oneUpMilestone += 10000;
        oneUpLabel.x = cannon.x - cannon.width / 2;
        oneUpLabel.y = cannon.y - cannon.height / 2;
        gameScene.addChild(oneUpLabel);
    }
    // The 1UP label travels upward
    oneUpLabel.zIndex = gameScene.children.length;
    oneUpLabel.y -= 10;
    if (oneUpLabel.y <= -20) {
        gameScene.removeChild(oneUpLabel);
    }

    // Allow the cannon to move
    if (!currentlyDead) {
        // Movement is different depending on the status effect
        if (cannon.tint != 0xFF0000) {
            if (cannon.tint == 0xFFFF00 || randomLevel == 3) {
                cannon.x -= cannon.vx;
                if (verticalAllowed) cannon.y -= cannon.vy;
            }
            else if (cannon.tint == 0xFFAA00 || randomLevel == 2) {
                cannon.x += cannon.vx * 3;
                if (verticalAllowed) cannon.y += cannon.vy * 3;
            }
            else if (cannon.tint == 0x00FFFF || randomLevel == 4) {
                cannon.x += cannon.vx / 3;
                if (verticalAllowed) cannon.y += cannon.vy / 3;
            }
            else {
                cannon.x += cannon.vx;
                if (verticalAllowed) cannon.y += cannon.vy;
            }
            if (!respawn) {
                globalVX = cannon.vx;
                globalVY = cannon.vy;
            }
        }
    }
    // Moves the cannon's hitbox to the cannon's position
    cannonHitbox.x = cannon.x + cannon.width / 2;
    cannonHitbox.y = cannon.y + 2;

    // Keep the cannon on the screen
    if (!currentlyDead) {
        if (cannon.tint == 0xFFAA00 || randomLevel == 2) {
            if (cannon.x < 31) cannon.x += 15;
            if (cannon.x > 569) cannon.x -= 15;
            if (cannon.y < 16) cannon.y += 15;
            if (cannon.y > 584) cannon.y -= 15;
        }
        else if (cannon.tint == 0x00FFFF || randomLevel == 4) {
            if (cannon.x < 31) cannon.x += 5 / 3;
            if (cannon.x > 569) cannon.x -= 5 / 3;
            if (cannon.y < 16) cannon.y += 5 / 3;
            if (cannon.y > 584) cannon.y -= 5 / 3;
        }
        else {
            if (cannon.x < 31) cannon.x += 5;
            if (cannon.x > 569) cannon.x -= 5;
            if (cannon.y < 16) cannon.y += 5;
            if (cannon.y > 584) cannon.y -= 5;
        }
    }

    // Move Lasers
    // player lasers
    for (let l of playerLasers) {
        if (cannon.tint == 0x000000) {
            l.alpha = 0.0;
        }
        l.move(dt);
    }
    // alien lasers; movement differs per level
    if (level == 1 || randomLevel == 1 || randomLevel == 2 || randomLevel == 3 || randomLevel == 4 || randomLevel == 5 || randomLevel == 6) {
        for (let i = 0; i < alienLasers.length; i++) {
            alienLasers[i].y += 6;
        }
    }
    if (randomLevel == 0) {
        for (let i = 0; i < alienLasers.length; i++) {
            alienLasers[i].y += alienLaserDirectionY[i] / 40;
            alienLasers[i].x += alienLaserDirectionX[i] / 40;
        }
    }
    if (level == 7) {
        for (let i = 0; i < alienLasers.length; i++) {
            alienLasers[i].y += alienLaserDirectionY[i];
            alienLasers[i].x += alienLaserDirectionX[i];
        }
    }

    // Alien lasers function differently per level
    if (level == 1 || randomLevel == 1 || randomLevel == 2 || randomLevel == 4 || randomLevel == 5 || randomLevel == 6) {
        // Creates arrays of each column of aliens and then uses RNG to determine if they fire a laser or not.
        // The columns are there so only the bottom alien of each column fires lasers.
        for (let a of aliens) {
            let aliensInColumn = [];
            aliensInColumn.push(a);
            for (let i = 0; i < aliens.length; i++) {
                if (aliens[i].x == a.x && aliens[i].y != a.y) {
                    aliensInColumn.push(aliens[i]);
                }
            }
            aliensInColumn.sort(function (a, b) { return a.y - b.y });

            let random = Math.floor((Math.random() * 5000) + 1);
            if (aliensInColumn[aliensInColumn.length - 1].tint == 0xFFFF00 || aliensInColumn[aliensInColumn.length - 1].tint == 0xFF0000) {
                if (random >= 1 && random <= 50) {
                    createLaser(aliensInColumn[aliensInColumn.length - 1].x, aliensInColumn[aliensInColumn.length - 1].y + 12, 0);
                    if (randomLevel != 6) {
                        enemyShootSound.play();
                    }
                }
            }
            else {
                if (random == 1) {
                    createLaser(aliensInColumn[aliensInColumn.length - 1].x, aliensInColumn[aliensInColumn.length - 1].y + 12, 0);
                    if (randomLevel != 6) {
                        enemyShootSound.play();
                    }
                }
            }
        }
    }
    if (randomLevel == 0) {
        // The aliens move in a circle and they fire lasers towards the center of the stage.
        for (let a of aliens) {
            let random = Math.floor((Math.random() * 2500) + 1);
            if (a.tint == 0xFFFF00 || a.tint == 0xFF0000) {
                if (random >= 1 && random <= 50) {
                    createLaser(a.x, a.y, a.rotation);
                    enemyShootSound.play();
                    let slopeY = 300 - a.y;
                    let slopeX = 300 - a.x;
                    alienLaserDirectionY.push(slopeY);
                    alienLaserDirectionX.push(slopeX);
                }
            }
            else {
                if (random == 1) {
                    createLaser(a.x, a.y, a.rotation);
                    enemyShootSound.play();
                    let slopeY = 300 - a.y;
                    let slopeX = 300 - a.x;
                    alienLaserDirectionY.push(slopeY);
                    alienLaserDirectionX.push(slopeX);
                }
            }
        }
    }
    if (randomLevel == 3) {
        // All aliens can fire at once in this level because there's no bottom alien in each column.
        for (let a of aliens) {
            let random = Math.floor((Math.random() * 1000) + 1);
            if (a.tint == 0xFFFF00 || a.tint == 0xFF0000) {
                if (random >= 1 && random <= 25) {
                    createLaser(a.x, a.y + 12, 0);
                    enemyShootSound.play();
                }
            }
            else {
                if (random == 1) {
                    createLaser(a.x, a.y + 12, 0);
                    enemyShootSound.play();
                }
            }
        }
    }

    // Program Boss Bizarro attacking
    if (level == 7) {
        if (!currentlyPerformingAttack) {
            // halts the countdown timer when the boss is getting angry
            if (steamyTimer <= 0) {
                timeUntilNextAttack -= dt;
            }
            // randomly selects the next attack
            if (timeUntilNextAttack <= 0) {
                currentlyPerformingAttack = true;
                if (cannon.tint != 0x33FF00 && bossHealth > 150) {
                    currentAttack = Math.floor((Math.random() * 2));
                }
                else {
                    currentAttack = Math.floor((Math.random() * 3));
                }
                healthAtStart = bossHealth;
            }
        }
        if (currentlyPerformingAttack) {
            // Different attacks can happen
            if (currentAttack == 0) { // Boss Bizarro charges for a bit then fires three lasers
                if (attackTimer <= 0) {
                    updateBossBizarro(1);
                    createCharge(bossBizarro.x, bossBizarro.y + 100, 0xFFFFFF);
                    spiritGun.play();
                    if (bossHealth > 150) {
                        attackTimer = 3;
                        spiritGun.fade(0, 1, 1000);
                    }
                    else {
                        attackTimer = 1.5;
                        spiritGun.fade(0, 1, 500);
                    }
                }
                else if (attackTimer > 0) {
                    attackTimer -= dt;
                    if (bossHealth > 150) {
                        charge.alpha += dt;
                    }
                    else {
                        charge.alpha += dt * 2;
                    }
                    if ((healthAtStart > 150 && bossHealth <= 150) || (healthAtStart > 0 && bossHealth <= 0)) {
                        // stops the boss from attacking once he gets angry
                        bossElements.splice(bossElements.indexOf(charge), 1);
                        gameScene.removeChild(charge);
                        spiritGun.stop();
                        currentlyPerformingAttack = false;
                        if (healthAtStart > 150 && bossHealth <= 150) {
                            timeUntilNextAttack = Math.random() + Math.floor((Math.random() * 2));
                        }
                        else if (healthAtStart > 0 && bossHealth <= 0) {
                            timeUntilNextAttack = 99999999999;
                        }
                        updateBossBizarro(0);
                        attackTimer = 0;
                    }
                    else if (attackTimer <= 0) {
                        bossElements.splice(bossElements.indexOf(charge), 1);
                        gameScene.removeChild(charge);
                        spiritGun.stop();
                        enemyShootSound.play();
                        let randomAngle = Math.random();
                        if (randomAngle < 0.3) {
                            randomAngle += 0.3;
                        }
                        createLaser(bossBizarro.x, bossBizarro.y + 100, 0);
                        let slopeY = 0;
                        let slopeX = 0;
                        if (bossHealth > 150) {
                            slopeY = 6;
                            slopeX = 0;
                        }
                        else {
                            slopeY = 8;
                            slopeX = 0;
                        }
                        alienLaserDirectionY.push(slopeY);
                        alienLaserDirectionX.push(slopeX);

                        createLaser(bossBizarro.x, bossBizarro.y + 100, -randomAngle);
                        let slopeY2 = 0;
                        let slopeX2 = 0;
                        if (bossHealth > 150) {
                            slopeY2 = 5;
                            slopeX2 = 5 * Math.tan(randomAngle);
                        }
                        else {
                            slopeY2 = 7;
                            slopeX2 = 7 * Math.tan(randomAngle);
                        }
                        alienLaserDirectionY.push(slopeY2);
                        alienLaserDirectionX.push(slopeX2);

                        createLaser(bossBizarro.x, bossBizarro.y + 100, randomAngle);
                        let slopeY3 = 0;
                        let slopeX3 = 0;
                        if (bossHealth > 150) {
                            slopeY3 = 4.7;
                            slopeX3 = 4.7 * Math.tan(-randomAngle);
                        }
                        else {
                            slopeY3 = 6.7;
                            slopeX3 = 6.7 * Math.tan(-randomAngle);
                        }
                        alienLaserDirectionY.push(slopeY3);
                        alienLaserDirectionX.push(slopeX3);
                        endBossAttack();
                    }
                }
            }
            else if (currentAttack == 1) { // Boss Bizarro charges for a while then fires a horizontal beam
                if (attackTimer <= 0) {
                    updateBossBizarro(1);
                    createCharge(bossBizarro.x, bossBizarro.y + 100, 0xFF0000);
                    spiritGun.play();
                    if (bossHealth > 150) {
                        attackTimer = 6;
                        spiritGun.fade(0, 1, 1000);
                    }
                    else {
                        attackTimer = 4;
                        spiritGun.fade(0, 1, 500);
                    }
                }
                else if (attackTimer > 0) {
                    attackTimer -= dt;
                    if (bossHealth > 150) {
                        charge.alpha += dt;
                    }
                    else {
                        charge.alpha += dt * 2;
                    }
                    charge.tint = 0xFF0000;
                    if ((healthAtStart > 150 && bossHealth <= 150) || (healthAtStart > 0 && bossHealth <= 0) || attackTimer <= 0 || chargeHealth <= 0) {
                        bossElements.splice(bossElements.indexOf(charge), 1);
                        gameScene.removeChild(charge);
                        spiritGun.stop();
                        if (chargeHealth <= 0) {
                            glassBreak.play();
                        }
                        else if (attackTimer <= 0) {
                            beamMoving = true;
                            beamSound.play();
                        }
                        endBossAttack();
                    }
                }
            }
            else if (currentAttack == 2) { // Boss Bizarro inlicts a random status ailment on the player
                if (attackTimer <= 0) {
                    updateBossBizarro(1);
                    if (bossHealth > 150) {
                        attackTimer = 1;
                    }
                    else {
                        attackTimer = 0.4;
                    }
                    snap.x = bossBizarro.x - 130;
                    snap.y = bossBizarro.y - 100;
                    bossElements.push(snap);
                    gameScene.addChild(snap);
                    click.play();
                    if (cannon.tint != 0x000000) {
                        let randomAilment = Math.floor((Math.random() * 6));
                        if (randomAilment == 0) {
                            cannon.tint = 0xFF0000;
                            ailmentTimer = 6;
                        }
                        if (randomAilment == 1) {
                            cannon.tint = 0xFFAA00;
                            ailmentTimer = 9;
                        }
                        if (randomAilment == 2) {
                            cannon.tint = 0xFFFF00;
                            ailmentTimer = 8;
                        }
                        if (randomAilment == 3) {
                            cannon.tint = 0x00FFFF;
                            ailmentTimer = 9;
                        }
                        if (randomAilment == 4) {
                            cannon.tint = 0x000000;
                            ailmentTimer = 10;
                        }
                        if (randomAilment == 5) {
                            cannon.tint = 0xFF00CC;
                            ailmentTimer = 4;
                        }
                    }
                }
                else if (attackTimer > 0) {
                    attackTimer -= dt;
                    if (bossHealth > 150) {
                        snap.width += 10;
                        snap.height += 10;
                    }
                    else {
                        snap.width += 20;
                        snap.height += 20;
                    }
                    if (attackTimer <= .5) {
                        snap.alpha -= dt * 2;
                    }
                    if ((healthAtStart > 150 && bossHealth <= 150) || (healthAtStart > 0 && bossHealth <= 0) || attackTimer <= 0) {
                        bossElements.splice(bossElements.indexOf(snap), 1);
                        gameScene.removeChild(snap);
                        snap.width = 52;
                        snap.height = 52;
                        snap.alpha = 1.0;
                        endBossAttack();
                    }
                }
            }
        }
    }
    // Handle level-specific timers
    // Red Light, Green Light
    if (randomLevel == 1) {
        // Handles switching between whether the player moves or the aliens move
        switchTimer -= dt;
        if (!respawn) {
            if (!aliensCanMove) {
                cannon.tint = 0x33FF00;
            }
            else {
                cannon.tint = 0xFF0000;
            }
        }
        if (snapNumber == 1 && switchTimer <= 1.5) {
            if (!aliensCanMove && !respawn) cannon.tint = 0xFF0001;
            fingerSnap.play();
            snapNumber = 2;
        }
        if (snapNumber == 2 && switchTimer <= 1) {
            if (!aliensCanMove && !respawn) cannon.tint = 0xFF0001;
            fingerSnap.play();
            snapNumber = 3;
        }
        if (snapNumber == 3 && switchTimer <= 0.5) {
            if (!aliensCanMove && !respawn) cannon.tint = 0xFF0001;
            fingerSnap.play();
            snapNumber = 4;
        }
        if (switchTimer <= 0) {
            if (aliensCanMove) {
                aliensCanMove = false;
                switchTimer = 4;
            }
            else {
                aliensCanMove = true;
                switchTimer = 6;
            }
            click.play();
            snapNumber = 1;
        }
    }
    // Dark Destruction
    if (randomLevel == 5) {
        // Random flashes of lightning that temporarily light up the screen
        if (lightningTimer > 0) {
            lightningTimer -= dt;
            if (lightningStrike && lightningTimer <= 0.25) {
                for (let a of aliens) {
                    a.alpha -= dt * 4;
                    if (!respawn) {
                        cannon.alpha = a.alpha;
                    }
                }
                for (let l of playerLasers) {
                    l.alpha -= dt * 4;
                }
            }
            if (lightningTimer <= 0) {
                if (!lightningStrike) {
                    lightningStrike = true;
                    cannon.tint = 0x33FF00;
                    for (let a of aliens) {
                        a.alpha = 1.0;
                    }
                    for (let l of playerLasers) {
                        l.alpha = 1.0;
                    }
                    if (thunderSFX == 1) {
                        thunder1.play();
                        thunderSFX = 2;
                        lightningTimer = 1.8;
                    }
                    else {
                        thunder2.play();
                        thunderSFX = 1;
                        lightningTimer = 2.9;
                    }
                }
                else if (lightningStrike) {
                    lightningStrike = false;
                    cannon.alpha = 1.0;
                    cannon.tint = 0x000000;
                    for (let a of aliens) {
                        a.alpha = 0.0;
                    }
                    for (let l of playerLasers) {
                        l.alpha = 0.0;
                    }
                    lightningTimer = Math.random() + Math.floor((Math.random() * 5) + 1);
                }
            }
        }
    }
    // Level 7
    if (level == 7) {
        // Moves the beam back to its starting position after a certain amount of time
        if (beamMoving) {
            beam.x -= 30;
            if (beam.x <= -1200) {
                beam.alpha -= dt * 2;
            }
            if (beam.alpha <= 0.0) {
                beam.x = 650;
                beam.alpha = 1.0;
                beamMoving = false;
            }
        }
        // Removes the status ailment cast on the player after a set amount of time
        if (ailmentTimer > 0) {
            ailmentTimer -= dt;
            if (ailmentTimer <= 0) {
                cannon.tint = 0x33FF00;
                ailmentTimer = 0;
            }
        }
        // Sets the amount of time fumes come out of the boss in anger
        if (steamyTimer > 0 && !bossDies) {
            steamyTimer -= dt;
            if (steamyTimer <= 0.75) {
                for (let s of steamFumes) {
                    s.alpha -= dt * 1.5;
                }
            }
            if (steamyTimer <= 0) {
                steamyTimer = 0;
                let amountOfFumes = steamFumes.length;
                for (let i = 0; i < amountOfFumes; i++) {
                    steamFumes.pop();
                }
            }
        }
        // Controls the explosions for when the boss loses
        if (deathTimer > 0) {
            deathTimer -= dt;
            if (deathTimer <= 0) {
                if (deathExplosions < 20) {
                    let randomX = Math.random() + Math.floor((Math.random() * 300)) + (bossBizarro.x-bossBizarro.width/2);
                    let randomY = Math.random() + Math.floor((Math.random() * 225)) + (bossBizarro.y-bossBizarro.height/2);
                    createAlienExplosion(randomX, randomY, 0xFFFFFF, 1.0, 125);
                    hitEnemySound.volume = 1.0;
                    hitEnemySound.play();
                    deathExplosions++;
                    deathTimer = 0.25;
                }
                else if (deathExplosions == 20) {
                    bossBizarro.isAlive = false;
                    gameScene.removeChild(bossBizarro);
                    bossBizarro.x = 100000;
                    bossBizarro.y = 100000;
                    deathExplosions++;
                    deathTimer = 1.5;
                }
                else {
                    bossDefeated = true;
                }
            }
        }
    }

    // Move aliens. Movement is different per level
    if (level == 1 || randomLevel == 4 || randomLevel == 5) {
        // Moves back and forth
        if (!alienMovement) {
            for (let i = 0; i < aliens.length; i++) {
                aliens[i].x -= 2;
            }
            for (let i = 0; i < aliens.length; i++) {
                if (aliens[i].x <= 0 + aliens[i].width / 2) {
                    alienMovement = true;
                    break;
                }
            }
        }
        if (alienMovement) {
            for (let i = 0; i < aliens.length; i++) {
                aliens[i].x += 2;
            }
            for (let i = 0; i < aliens.length; i++) {
                if (aliens[i].x >= 600 - aliens[i].width / 2) {
                    alienMovement = false;
                    break;
                }
            }
        }
    }
    if (randomLevel == 0) {
        // Moves in a circle
        for (let i = 0; i < aliens.length; i++) {
            if (direction[i] == 1) {
                angles[i] -= (speed[i] * dt);
            }
            else if (direction[i] == 2) {
                angles[i] += (speed[i] * dt);
            }
            aliens[i].x = (Math.sin(angles[i]) * radii[i]) + 300;
            aliens[i].y = (Math.cos(angles[i]) * radii[i]) + 300;
            let rotationAngle = Math.atan2(300 - aliens[i].y, 300 - aliens[i].x);
            aliens[i].rotation = rotationAngle - (Math.PI / 2);
        }
    }
    if (randomLevel == 1) {
        // Similar to level 1, but aliens move slightly faster. Also they only move if it's their turn to move.
        if (aliensCanMove) {
            if (!alienMovement) {
                for (let i = 0; i < aliens.length; i++) {
                    aliens[i].x -= 5;
                }
                for (let i = 0; i < aliens.length; i++) {
                    if (aliens[i].x <= 0 + aliens[i].width / 2) {
                        alienMovement = true;
                        break;
                    }
                }
            }
            if (alienMovement) {
                for (let i = 0; i < aliens.length; i++) {
                    aliens[i].x += 5;
                }
                for (let i = 0; i < aliens.length; i++) {
                    if (aliens[i].x >= 600 - aliens[i].width / 2) {
                        alienMovement = false;
                        break;
                    }
                }
            }
        }
    }
    if (randomLevel == 2) {
        // Similar to level 1, but aliens move slightly faster.
        if (!alienMovement) {
            for (let i = 0; i < aliens.length; i++) {
                aliens[i].x -= 7;
            }
            for (let i = 0; i < aliens.length; i++) {
                if (aliens[i].x <= 0 + aliens[i].width / 2) {
                    alienMovement = true;
                    break;
                }
            }
        }
        if (alienMovement) {
            for (let i = 0; i < aliens.length; i++) {
                aliens[i].x += 7;
            }
            for (let i = 0; i < aliens.length; i++) {
                if (aliens[i].x >= 600 - aliens[i].width / 2) {
                    alienMovement = false;
                    break;
                }
            }
        }
    }
    if (randomLevel == 3) {
        // Moves with the player. Wraps around the screen
        for (let i = 0; i < aliens.length; i++) {
            if (!reverseMovement) {
                aliens[i].x += globalVX;
                aliens[i].y += globalVY;
            }
            else {
                aliens[i].x -= globalVX;
                aliens[i].y -= globalVY;
            }
            if (aliens[i].x < 0) {
                aliens[i].x = 600;
            }
            if (aliens[i].x > 600) {
                aliens[i].x = 0;
            }
            if (aliens[i].y < 0) {
                aliens[i].y = 600;
            }
            if (aliens[i].y > 600) {
                aliens[i].y = 0;
            }
        }
        if ((aliens.length > 18 && aliens.length <= 24) || (aliens.length > 6 && aliens.length <= 12)) {
            reverseMovement = false;
        }
        else {
            reverseMovement = true;
        }
    }
    if (randomLevel == 6) {
        // Moves back and forth extremely fast
        if (!alienMovement) {
            for (let i = 0; i < aliens.length; i++) {
                aliens[i].x -= 30;
            }
            for (let i = 0; i < aliens.length; i++) {
                if (aliens[i].x <= 0 + aliens[i].width / 2) {
                    alienMovement = true;
                    break;
                }
            }
        }
        if (alienMovement) {
            for (let i = 0; i < aliens.length; i++) {
                aliens[i].x += 30;
            }
            for (let i = 0; i < aliens.length; i++) {
                if (aliens[i].x >= 600 - aliens[i].width / 2) {
                    alienMovement = false;
                    break;
                }
            }
        }
    }
    if (level == 7) {
        // The boss moves back and forth unless he's performing an action
        if (!currentlyPerformingAttack && steamyTimer == 0) {
            if (!alienMovement) {
                if (bossHealth > 150) {
                    bossBizarro.x -= 1;
                }
                else {
                    bossBizarro.x -= 5;
                }
                if (bossBizarro.x <= 0 + bossBizarro.width / 2) {
                    alienMovement = true;
                }
            }
            if (alienMovement) {
                if (bossHealth > 150) {
                    bossBizarro.x += 1;
                }
                else {
                    bossBizarro.x += 5;
                }
                if (bossBizarro.x >= 600 - bossBizarro.width / 2) {
                    alienMovement = false;
                }
            }
            updateBossBizarro(0);
        }
    }

    // Handle respawn invincibility. Invincibility lasts for about 2.5 seconds.
    if (respawn) {
        cannon.tint = 0xFFFFFF;
        respawnInvincibility += dt;
        globalVX = 0;
        globalVY = 0;
        if (respawnInvincibility >= 2.5) {
            if (randomLevel == 2) {
                cannon.tint = 0xFFAA00;
            }
            else if (randomLevel == 3) {
                cannon.tint = 0xFFFF00;
            }
            else if (randomLevel == 4) {
                cannon.tint = 0x00FFFF;
            }
            else if (randomLevel == 5 && !lightningStrike) {
                cannon.tint = 0x000000;
            }
            else {
                cannon.tint = 0x33FF00;
            }
            respawnInvincibility = 0;
            respawn = false;
        }
    }

    // If the boss's health reaches zero, makes him explode with dramatic flare
    if (level == 7) {
        if (bossHealth == 0 && !bossDies) {
            bossDies = true;
            currentlyPerformingAttack = true;
            steamyTimer = 9999999;
            deathTimer = 0.25;
        }
    }

    // Check for collisions
    // Player lasers
    for (let l of playerLasers) {
        for (let i = 0; i < aliens.length; i++) {
            if (rectsIntersect(aliens[i], l)) {
                if (aliens[i].tint == 0x00FFFF) {
                    aliens[i].tint = 0xFFFFFF;
                    increaseScoreBy(50);
                }
                else if (aliens[i].tint == 0xFF0000) {
                    aliens[i].tint = 0xFFFF00;
                    aliens[i].animationSpeed = 1 / 6;
                    increaseScoreBy(50);
                }
                else {
                    createAlienExplosion(aliens[i].x, aliens[i].y, aliens[i].tint, aliens[i].alpha, aliens[i].height);
                    gameScene.removeChild(aliens[i]);
                    aliens[i].isAlive = false;
                    aliens = aliens.filter(a => a.isAlive);
                    angles.splice(i, 1);
                    radii.splice(i, 1);
                    direction.splice(i, 1);
                    speed.splice(i, 1);
                    if (randomLevel != 6) {
                        hitEnemySound.play();
                    }
                }
                gameScene.removeChild(l);
                l.isAlive = false;
                increaseScoreBy(100);
            }
        }
        if (level == 7) {
            if (rectsIntersect(bossBizarro, l)) {
                if (cannon.tint == 0xFF00CC && bossHealth < 300) {
                    bossHealth++;
                }
                else {
                    if (bossHealth > 0) {
                        bossHealth--;
                        increaseScoreBy(50);
                    }
                }
                updateHealthBar();
                gameScene.removeChild(l);
                l.isAlive = false;
            }
            // Allows red charges from the boss to be broken
            if (bossElements.includes(charge)) {
                if (rectsIntersect(charge, l) && charge.tint != 0xFFFFFF) {
                    chargeHealth--;
                    charge.tint = 0xFFFFFF;
                    gameScene.removeChild(l);
                    l.isAlive = false;
                }
            }
        }
        if (l.y < -10) l.isAlive = false;
    }
    // Alien lasers
    for (let i = 0; i < alienLasers.length; i++) {
        for (let b of barriers) {
            if (rectsIntersect(b, alienLasers[i])) {
                if (b.tint == 0x33FF00) {
                    b.tint = 0x8FFF00;
                }
                else if (b.tint == 0x8FFF00) {
                    b.tint = 0xFFFF00;
                }
                else if (b.tint == 0xFFFF00) {
                    b.tint = 0xFFAA00;
                }
                else if (b.tint == 0xFFAA00) {
                    b.tint = 0xFF0000;
                }
                else {
                    createBarrierDestruction(b.x, b.y, b.tint);
                    gameScene.removeChild(b);
                    b.isAlive = false;
                }
                removeAlienLaser(i);
            }
        }
        if (rectsIntersect(alienLasers[i], cannonHitbox)) {
            playerDies();
            removeAlienLaser(i);
        }
        if ((alienLasers[i].x < -25 || alienLasers[i].x > 625 || alienLasers[i].y < -25 || alienLasers[i].y > 625) && level != 7) {
            removeAlienLaser(i);
        }
    }
    // Aliens themselves
    for (let a of aliens) {
        if (rectsIntersect(a, cannonHitbox)) {
            playerDies();
        }
    }
    // The boss's energy beam
    if (level == 7 && rectsIntersect(beam, cannonHitbox)) {
        playerDies();
    }

    // get rid of dead objects
    playerLasers = playerLasers.filter(l => l.isAlive);
    alienLasers = alienLasers.filter(l => l.isAlive);
    aliens = aliens.filter(a => a.isAlive);
    barriers = barriers.filter(b => b.isAlive);
    explosions = explosions.filter(e => e.isAlive);

    // end the level if the player defeats all aliens or defeats the boss
    if ((level != 7 && aliens.length <= 0) || (level == 7 && bossDefeated)) {
        if (randomLevel == 6) {
            increaseScoreBy(30000);
        }
        end();
        return;
    }
}

// controls player death
function playerDies() {
    if (!respawn) {
        if (randomLevel != 6) {
            hitPlayerSound.play();
        }
        globalVX = 0;
        globalVY = 0;
        currentlyDead = true;
        createPlayerExplosion(cannon.x, cannon.y, cannon.tint, 1);
        cannon.x = 10000;
        cannon.y = 10000;
        cannonHitbox.x = cannon.x;
        cannon.y = cannon.y - 5;
        decreaseLivesBy(1);
    }
}

// removes the alien laser
function removeAlienLaser(index) {
    gameScene.removeChild(alienLasers[index]);
    alienLasers[index].isAlive = false;
    if (alienLaserDirectionX.length > 0 && alienLaserDirectionY.length > 0) {
        alienLaserDirectionX.splice(index, 1);
        alienLaserDirectionY.splice(index, 1);
    }
}

// player fires a laser
function fireLaser() {
    if (paused || currentlyDead) return;
    let l1 = new Laser(0xFFFFFF, cannon.x, cannon.y - 18);
    playerLasers.push(l1);
    gameScene.addChild(l1);
    if (randomLevel != 6) {
        playerShootSound.play();
    }
}

// update Boss Bizarro's position and status by removing the old frame and replacing it with a new one
function updateBossBizarro(frame) {
    let currentX = bossBizarro.x;
    let currentY = bossBizarro.y;
    if (level == 7) {
        gameScene.removeChild(bossBizarro);
    }
    bossBizarro = new PIXI.Sprite(bossBizarroTexture[frame]);
    bossBizarro.anchor.set(.5, .5); // position, scaling, rotating etc are now from center of sprite
    bossBizarro.x = currentX;
    bossBizarro.y = currentY;
    if (bossHealth > 150) {
        bossBizarro.tint = 0xFF00CC;
    }
    else if (bossHealth <= 150 && bossHealth > 50) {
        bossBizarro.tint = 0xFF0000;
    }
    else {
        bossBizarro.tint = 0x990000;
    }
    // the boss gets angry once his health reaches below 150
    if (bossHealth <= 150 && !gotAngry) {
        gotAngry = true;
        createSteam(bossBizarro.x - 160, bossBizarro.y - 98, Math.PI);
        createSteam(bossBizarro.x + 160, bossBizarro.y - 98, 0);
        steamyTimer = 3.5;
        trainWhistle.play();
    }
    bossElements.push(bossBizarro);
    gameScene.addChild(bossBizarro);
}

// updates the boss's health bar by removing the old frame and replacing it with a new one
function updateHealthBar() {
    if (level == 7) {
        gameScene.removeChild(healthBar);
    }
    healthBar = new PIXI.Sprite(healthBarTexture[bossHealth]);
    healthBar.anchor.set(.5, .5); // position, scaling, rotating etc are now from center of sprite
    healthBar.x = 300;
    healthBar.y = 100;
    bossElements.push(healthBar);
    gameScene.addChild(healthBar);
}

// ends the boss's attack and sets the amount of time until the next attack
function endBossAttack() {
    currentlyPerformingAttack = false;
    if (bossHealth > 150) {
        timeUntilNextAttack = Math.random() + Math.floor((Math.random() * 2)) + 2.5;
    }
    else if (bossHealth <= 150 && bossHealth > 50) {
        timeUntilNextAttack = Math.random() + Math.floor((Math.random() * 2));
    }
    else if (bossHealth <= 50 && bossHealth > 0) {
        timeUntilNextAttack = 0.05;
    }
    else {
        timeUntilNextAttack = 9999999999;
    }
    updateBossBizarro(0);
    attackTimer = 0;
    chargeHealth = 15;
}

// loads different assets into gameScene according to the current level
function loadLevel() {
    if (level == 1) { // Just Like Old Times
        cannon.x = 300;
        cannon.y = 550;
        cannonHitbox.x = cannon.x;
        cannon.y = cannon.y - 5;
        respawn = true;
        respawnInvincibility = 0;
        verticalAllowed = false;
        for (let i = 0; i < 7; i++) {
            createOctopus(60 * (i + 1) + 60, 300);
            createCrab(60 * (i + 1) + 60, 260);
            createCrab(60 * (i + 1) + 60, 220);
            createSquid(60 * (i + 1) + 60, 180);
            createSquid(60 * (i + 1) + 60, 140);
        }
        for (let i = 0; i < aliens.length; i++) {
            let random = Math.floor((Math.random() * 100) + 1);
            if (random >= 1 && random <= 5) {
                aliens[i].tint = 0x00FFFF;
            }
            else if (random >= 6 && random <= 10) {
                aliens[i].animationSpeed = 1 / 6;
                aliens[i].tint = 0xFFFF00;
            }
        }
        alienMovement = false;
        createBarriers();
        mercuryStart.play();
    }
    if (randomLevel == 0) { // The Carousel Crew
        cannon.x = 300;
        cannon.y = 300;
        cannonHitbox.x = cannon.x;
        cannon.y = cannon.y - 5;
        respawn = true;
        respawnInvincibility = 0;
        verticalAllowed = true;
        for (let i = 0; i < 18; i++) {
            if (i >= 0 && i <= 5) {
                radii[i] = 170;
                createOctopus(300 + radii[i], 300 + radii[i]);
                direction[i] = 1;
            }
            if (i >= 6 && i <= 11) {
                radii[i] = 220;
                createCrab(300 + radii[i], 300 + radii[i]);
                direction[i] = 2;
            }
            if (i >= 12 && i < 18) {
                radii[i] = 270;
                createSquid(300 + radii[i], 300 + radii[i]);
                direction[i] = 1;
            }
            speed[i] = 2;
        }
        for (let i = 0; i < aliens.length; i++) {
            if (i == 0 || i == 6 || i == 12) {
                angles[i] = 0;
            }
            if (i == 1 || i == 7 || i == 13) {
                angles[i] = 1;
            }
            if (i == 2 || i == 8 || i == 14) {
                angles[i] = 2;
            }
            if (i == 3 || i == 9 || i == 15) {
                angles[i] = 3;
            }
            if (i == 4 || i == 10 || i == 16) {
                angles[i] = 4;
            }
            if (i == 5 || i == 11 || i == 17) {
                angles[i] = 5;
            }
        }
        progressingDifficulty();
        merryGoRound.play();
    }
    if (randomLevel == 1) { // Red Light, Green Light
        cannon.x = 300;
        cannon.y = 550;
        cannon.tint = 0x33FF00;
        cannonHitbox.x = cannon.x;
        cannon.y = cannon.y - 5;
        respawn = true;
        respawnInvincibility = 0;
        verticalAllowed = false;
        for (let i = 0; i < 7; i++) {
            createOctopus(60 * (i + 1) + 60, 340);
            createOctopus(60 * (i + 1) + 60, 300);
            createCrab(60 * (i + 1) + 60, 260);
            createCrab(60 * (i + 1) + 60, 220);
            createSquid(60 * (i + 1) + 60, 180);
            createSquid(60 * (i + 1) + 60, 140);
        }
        progressingDifficulty();
        alienMovement = false;
        createBarriers();
        aliensCanMove = false;
        switchTimer = 4;
        snapNumber = 1;
        beepBlock.play();
    }
    if (randomLevel == 2) { // Motor Overload
        cannon.x = 300;
        cannon.y = 550;
        cannonHitbox.x = cannon.x;
        cannon.y = cannon.y - 5;
        respawn = true;
        respawnInvincibility = 0;
        verticalAllowed = false;
        for (let i = 0; i < 7; i++) {
            createOctopus(60 * (i + 1) + 60, 340);
            createOctopus(60 * (i + 1) + 60, 300);
            createCrab(60 * (i + 1) + 60, 260);
            createCrab(60 * (i + 1) + 60, 220);
            createSquid(60 * (i + 1) + 60, 180);
            createSquid(60 * (i + 1) + 60, 140);
        }
        progressingDifficulty();
        for (let i = 0; i < aliens.length; i++) {
            let randomSize = Math.floor((Math.random() * 2));
            if (randomSize == 0) {
                aliens[i].width *= 0.5;
                aliens[i].height *= 0.5;
            }
            else {
                aliens[i].width *= 1;
                aliens[i].height *= 1;
            }
        }
        createBarriers();
        infiniteBlue.play();
    }
    if (randomLevel == 3) { // Hijack
        cannon.x = 300;
        cannon.y = 300;
        cannon.tint = 0xFFFF00;
        cannonHitbox.x = cannon.x;
        cannon.y = cannon.y - 5;
        respawn = true;
        respawnInvincibility = 0;
        verticalAllowed = true;
        for (let i = 0; i < 4; i++) {
            createOctopus(150 * (i + 1) - 75, 600);
            createOctopus(150 * (i + 1) - 75, 500);
            createCrab(150 * (i + 1) - 75, 400);
            createCrab(150 * (i + 1) - 75, 300);
            createSquid(150 * (i + 1) - 75, 200);
            createSquid(150 * (i + 1) - 75, 100);
        }
        progressingDifficulty();
        gameSong.play();
    }
    if (randomLevel == 4) { // C-C-C-Cold Chaos
        cannon.x = 300;
        cannon.y = 550;
        cannonHitbox.x = cannon.x;
        cannon.y = cannon.y - 5;
        respawn = true;
        respawnInvincibility = 0;
        verticalAllowed = false;
        for (let i = 0; i < 5; i++) {
            createOctopus(100 * (i + 1), 340);
            createCrab(100 * (i + 1), 280);
            createCrab(100 * (i + 1), 220);
            createSquid(100 * (i + 1), 160);
            createSquid(100 * (i + 1), 100);
        }
        progressingDifficulty();
        for (let i = 0; i < aliens.length; i++) {
            let randomSize = Math.floor((Math.random() * 3));
            if (randomSize == 0) {
                aliens[i].width *= 0.5;
                aliens[i].height *= 0.5;
            }
            else if (randomSize == 2) {
                aliens[i].width *= 1.5;
                aliens[i].height *= 1.5;
            }
            else {
                aliens[i].width *= 1;
                aliens[i].height *= 1;
            }
        }
        createBarriers();
        freezeFlame.play();
    }
    if (randomLevel == 5) { // Dark Destruction
        cannon.x = 300;
        cannon.y = 550;
        cannon.tint = 0x000000;
        cannonHitbox.x = cannon.x;
        cannon.y = cannon.y - 5;
        respawn = true;
        respawnInvincibility = 0;
        verticalAllowed = false;
        for (let i = 0; i < 7; i++) {
            createOctopus(60 * (i + 1), 340);
            createOctopus(60 * (i + 1), 300);
            createCrab(60 * (i + 1), 260);
            createCrab(60 * (i + 1), 220);
            createSquid(60 * (i + 1), 180);
            createSquid(60 * (i + 1), 140);
        }
        progressingDifficulty();
        for (let i = 0; i < aliens.length; i++) {
            aliens[i].alpha = 0.0;
        }
        alienMovement = false;
        lightningStrike = false;
        lightningTimer = Math.random() + Math.floor((Math.random() * 5) + 1);
        thunderSFX = 1;
        suspendedDoll.play();
    }
    if (randomLevel == 6) { // DANGER!
        cannon.x = 300;
        cannon.y = 550;
        cannonHitbox.x = cannon.x;
        cannon.y = cannon.y - 5;
        respawn = true;
        respawnInvincibility = 0;
        verticalAllowed = false;
        for (let i = 0; i < 9; i++) {
            createOctopus(60 * (i + 1), 340);
            createOctopus(60 * (i + 1), 300);
            createCrab(60 * (i + 1), 260);
            createCrab(60 * (i + 1), 220);
            createSquid(60 * (i + 1), 180);
            createSquid(60 * (i + 1), 140);
        }
        for (let i = 0; i < aliens.length; i++) {
            aliens[i].animationSpeed = 1 / 2;
            aliens[i].tint = 0xFF0000;
        }
        alienMovement = true;
        createBarriers();
        pizzaTime.play();
    }
    if (level == 7) { // Boss Battle
        cannon.x = 300;
        cannon.y = 550;
        cannonHitbox.x = cannon.x;
        cannon.y = cannon.y - 5;
        respawn = true;
        respawnInvincibility = 0;
        verticalAllowed = false;
        bossBizarro = new PIXI.Sprite(bossBizarroTexture[0]);
        bossBizarro.anchor.set(.5, .5); // position, scaling, rotating etc are now from center of sprite
        bossBizarro.x = 300;
        bossBizarro.y = 250;
        bossHealth = 300;
        updateBossBizarro(0);
        bossElements.push(bossBizarro);
        alienMovement = true;
        healthBar = new PIXI.Sprite(healthBarTexture[bossHealth]);
        updateHealthBar();
        bossElements.push(healthBar);
        bossLabel = new PIXI.Text("BOSS BIZARRO");
        bossLabel.style = new PIXI.TextStyle({
            fill: 0xFF00CC,
            fontSize: 27,
            fontFamily: "Press Start 2P",
        });
        bossLabel.x = 140;
        bossLabel.y = 50;
        gameScene.addChild(bossLabel);
        bossElements.push(bossLabel);
        beam.x = 650;
        beam.y = 450;
        beam.alpha = 1.0;
        beamMoving = false;
        bossElements.push(beam);
        gameScene.addChild(beam);
        
        endBossAttack();
        gotAngry = false;
        ailmentTimer = 0;
        steamyTimer = 0;
        bossDies = false;
        deathTimer = 0;
        deathExplosions = 0;
        mitsuo.play();
    }
    paused = false;

    // Increases the chances of aliens spawning as different colors according to the current level
    function progressingDifficulty() {
        for (let i = 0; i < aliens.length; i++) {
            let random = Math.floor((Math.random() * 100) + 1);
            switch (level) {
                case 2:
                    if (randomLevel == 2) {
                        if (random >= 1 && random <= 5) {
                            aliens[i].tint = 0x00FFFF;
                        }
                        else if (random >= 40 && random <= 99) {
                            aliens[i].animationSpeed = 1 / 6;
                            aliens[i].tint = 0xFFFF00;
                        }
                        else if (random == 100) {
                            if (randomLevel == 0 || completedRandomLevels[0] == 1) {
                                aliens[i].animationSpeed = 1 / 2;
                                aliens[i].tint = 0xFF0000;
                            }
                        }
                    }
                    else if (randomLevel == 4) {
                        if (random >= 95 && random <= 99) {
                            aliens[i].animationSpeed = 1 / 6;
                            aliens[i].tint = 0xFFFF00;
                        }
                        else if (random == 100) {
                            if (randomLevel == 0 || completedRandomLevels[0] == 1) {
                                aliens[i].animationSpeed = 1 / 2;
                                aliens[i].tint = 0xFF0000;
                            }
                        }
                        else {
                            aliens[i].tint = 0x00FFFF;
                        }
                    }
                    else {
                        if (random >= 1 && random <= 5) {
                            aliens[i].tint = 0x00FFFF;
                        }
                        else if (random >= 95 && random <= 99) {
                            aliens[i].animationSpeed = 1 / 6;
                            aliens[i].tint = 0xFFFF00;
                        }
                        else if (random == 100) {
                            if (randomLevel == 0 || completedRandomLevels[0] == 1) {
                                aliens[i].animationSpeed = 1 / 2;
                                aliens[i].tint = 0xFF0000;
                            }
                        }
                    }
                    break;
                case 3:
                    if (randomLevel == 2) {
                        if (random >= 1 && random <= 8) {
                            aliens[i].tint = 0x00FFFF;
                        }
                        else if (random >= 39 && random <= 98) {
                            aliens[i].animationSpeed = 1 / 6;
                            aliens[i].tint = 0xFFFF00;
                        }
                        else if (random == 99 || random == 100) {
                            if (randomLevel == 0 || completedRandomLevels[0] == 1) {
                                aliens[i].animationSpeed = 1 / 2;
                                aliens[i].tint = 0xFF0000;
                            }
                        }
                    }
                    else if (randomLevel == 4) {
                        if (random >= 91 && random <= 98) {
                            aliens[i].animationSpeed = 1 / 6;
                            aliens[i].tint = 0xFFFF00;
                        }
                        else if (random == 99 || random == 100) {
                            if (randomLevel == 0 || completedRandomLevels[0] == 1) {
                                aliens[i].animationSpeed = 1 / 2;
                                aliens[i].tint = 0xFF0000;
                            }
                        }
                        else {
                            aliens[i].tint = 0x00FFFF;
                        }
                    }
                    else {
                        if (random >= 1 && random <= 8) {
                            aliens[i].tint = 0x00FFFF;
                        }
                        else if (random >= 91 && random <= 98) {
                            aliens[i].animationSpeed = 1 / 6;
                            aliens[i].tint = 0xFFFF00;
                        }
                        else if (random == 99 || random == 100) {
                            if (randomLevel == 0 || completedRandomLevels[0] == 1) {
                                aliens[i].animationSpeed = 1 / 2;
                                aliens[i].tint = 0xFF0000;
                            }
                        }
                    }
                    break;
                case 4:
                    if (randomLevel == 2) {
                        if (random >= 1 && random <= 12) {
                            aliens[i].tint = 0x00FFFF;
                        }
                        else if (random >= 38 && random <= 97) {
                            aliens[i].animationSpeed = 1 / 6;
                            aliens[i].tint = 0xFFFF00;
                        }
                        else if (random >= 98 && random <= 100) {
                            if (randomLevel == 0 || completedRandomLevels[0] == 1) {
                                aliens[i].animationSpeed = 1 / 2;
                                aliens[i].tint = 0xFF0000;
                            }
                        }
                    }
                    else if (randomLevel == 4) {
                        if (random >= 85 && random <= 97) {
                            aliens[i].animationSpeed = 1 / 6;
                            aliens[i].tint = 0xFFFF00;
                        }
                        else if (random >= 98 && random <= 100) {
                            if (randomLevel == 0 || completedRandomLevels[0] == 1) {
                                aliens[i].animationSpeed = 1 / 2;
                                aliens[i].tint = 0xFF0000;
                            }
                        }
                        else {
                            aliens[i].tint = 0x00FFFF;
                        }
                    }
                    else {
                        if (random >= 1 && random <= 12) {
                            aliens[i].tint = 0x00FFFF;
                        }
                        else if (random >= 85 && random <= 97) {
                            aliens[i].animationSpeed = 1 / 6;
                            aliens[i].tint = 0xFFFF00;
                        }
                        else if (random >= 98 && random <= 100) {
                            if (randomLevel == 0 || completedRandomLevels[0] == 1) {
                                aliens[i].animationSpeed = 1 / 2;
                                aliens[i].tint = 0xFF0000;
                            }
                        }
                    }
                    break;
                case 5:
                    if (randomLevel == 2) {
                        if (random >= 1 && random <= 16) {
                            aliens[i].tint = 0x00FFFF;
                        }
                        else if (random >= 37 && random <= 96) {
                            aliens[i].animationSpeed = 1 / 6;
                            aliens[i].tint = 0xFFFF00;
                        }
                        else if (random >= 97 && random <= 100) {
                            if (randomLevel == 0 || completedRandomLevels[0] == 1) {
                                aliens[i].animationSpeed = 1 / 2;
                                aliens[i].tint = 0xFF0000;
                            }
                        }
                    }
                    else if (randomLevel == 4) {
                        if (random >= 81 && random <= 96) {
                            aliens[i].animationSpeed = 1 / 6;
                            aliens[i].tint = 0xFFFF00;
                        }
                        else if (random >= 97 && random <= 100) {
                            if (randomLevel == 0 || completedRandomLevels[0] == 1) {
                                aliens[i].animationSpeed = 1 / 2;
                                aliens[i].tint = 0xFF0000;
                            }
                        }
                        else {
                            aliens[i].tint = 0x00FFFF;
                        }
                    }
                    else {
                        if (random >= 1 && random <= 16) {
                            aliens[i].tint = 0x00FFFF;
                        }
                        else if (random >= 81 && random <= 96) {
                            aliens[i].animationSpeed = 1 / 6;
                            aliens[i].tint = 0xFFFF00;
                        }
                        else if (random >= 97 && random <= 100) {
                            if (randomLevel == 0 || completedRandomLevels[0] == 1) {
                                aliens[i].animationSpeed = 1 / 2;
                                aliens[i].tint = 0xFF0000;
                            }
                        }
                    }
                    break;
                case 6:
                    if (randomLevel == 2) {
                        if (random >= 1 && random <= 20) {
                            aliens[i].tint = 0x00FFFF;
                        }
                        else if (random >= 36 && random <= 95) {
                            aliens[i].animationSpeed = 1 / 6;
                            aliens[i].tint = 0xFFFF00;
                        }
                        else if (random >= 96 && random <= 100) {
                            if (randomLevel == 0 || completedRandomLevels[0] == 1) {
                                aliens[i].animationSpeed = 1 / 2;
                                aliens[i].tint = 0xFF0000;
                            }
                        }
                    }
                    else if (randomLevel == 4) {
                        if (random >= 76 && random <= 95) {
                            aliens[i].animationSpeed = 1 / 6;
                            aliens[i].tint = 0xFFFF00;
                        }
                        else if (random >= 96 && random <= 100) {
                            if (randomLevel == 0 || completedRandomLevels[0] == 1) {
                                aliens[i].animationSpeed = 1 / 2;
                                aliens[i].tint = 0xFF0000;
                            }
                        }
                        else {
                            aliens[i].tint = 0x00FFFF;
                        }
                    }
                    else {
                        if (random >= 1 && random <= 20) {
                            aliens[i].tint = 0x00FFFF;
                        }
                        else if (random >= 76 && random <= 95) {
                            aliens[i].animationSpeed = 1 / 6;
                            aliens[i].tint = 0xFFFF00;
                        }
                        else if (random >= 96 && random <= 100) {
                            if (randomLevel == 0 || completedRandomLevels[0] == 1) {
                                aliens[i].animationSpeed = 1 / 2;
                                aliens[i].tint = 0xFF0000;
                            }
                        }
                    }
                    break;
            }
        }
    }

    // Creates barriers for certain levels
    function createBarriers() {
        let barrier1 = new Barrier();
        barrier1.x = 125;
        barrier1.y = 450;
        barriers.push(barrier1);
        gameScene.addChild(barrier1);
        let barrier2 = new Barrier();
        barrier2.x = 300;
        barrier2.y = 450;
        barriers.push(barrier2);
        gameScene.addChild(barrier2);
        let barrier3 = new Barrier();
        barrier3.x = 475;
        barrier3.y = 450;
        barriers.push(barrier3);
        gameScene.addChild(barrier3);
    }
}

// triggers if the player either wins or loses
function end() {
    paused = true;
    //stop all music and looping sound effects
    for (let sound of sounds) {
        sound.stop();
    }

    //clear out level
    gameScene.removeChild(oneUpLabel);

    playerLasers.forEach(l => gameScene.removeChild(l));
    playerLasers = [];

    alienLasers.forEach(l => gameScene.removeChild(l));
    alienLasers = [];

    aliens.forEach(a => gameScene.removeChild(a));
    aliens = [];

    barriers.forEach(b => gameScene.removeChild(b));
    barriers = [];

    explosions.forEach(e => gameScene.removeChild(e));
    explosions = [];

    angles.forEach(a => gameScene.removeChild(a));
    angles = [];
    radii.forEach(r => gameScene.removeChild(r));
    radii = [];
    direction.forEach(d => gameScene.removeChild(d));
    direction = [];
    speed.forEach(s => gameScene.removeChild(s));
    speed = [];
    alienLaserDirectionX.forEach(l => gameScene.removeChild(l));
    alienLaserDirectionX = [];
    alienLaserDirectionY.forEach(l => gameScene.removeChild(l));
    alienLaserDirectionY = [];

    bossElements.forEach(e => gameScene.removeChild(e));
    bossElements = [];

    // goes to Game Over scene if the player loses
    if (lives <= 0) {
        gameOverScoreLabel.text = "Your final score:\n\n" + score;
        level = 1;
        randomLevel = 99;
        completedRandomLevels = [0, 0, 0, 0, 0, 0, 0];
        score = 0;
        lives = 5;
        oneUpMilestone = 10000;
        currentlyDead = false;
        // storyLabel is changed here in case the player wants to play again
        storyLabel.text = "So you want another go, don't\nyou? Fine then. I'm sure\nit'll be same as it was last\ntime anyways.";
        changeHelpText();
        gameOverScene.visible = true;
        gameScene.visible = false;
    }
    // goes to Clear scene if the player wins
    else if (lives > 0) {
        completedRandomLevels[randomLevel] = 1;
        let numberOfLevelsLeft = 7 - level;
        // skips stright to the boss level if the player beats DANGER!
        if (completedRandomLevels[6] == 1 && level != 7) {
            increaseLevelBy(numberOfLevelsLeft);
        }
        else {
            increaseLevelBy(1);
        }
        // randomizer that determines which level will show up next. The do/while loop ensures that the same
        // level isn't played twice. The Carousel Crew has a higher chance of appearing and DANGER! has a 
        // lower chance of appearing.
        if (numberOfLevelsLeft > 0 && level != 7) {
            do {
                let randomNumber = Math.floor((Math.random() * 100) + 1);
                if (randomNumber >= 1 && randomNumber <= 31) {
                    randomLevel = 0;
                }
                else if (randomNumber >= 32 && randomNumber <= 44) {
                    randomLevel = 1;
                }
                else if (randomNumber >= 45 && randomNumber <= 57) {
                    randomLevel = 2;
                }
                else if (randomNumber >= 58 && randomNumber <= 70) {
                    randomLevel = 3;
                }
                else if (randomNumber >= 71 && randomNumber <= 83) {
                    randomLevel = 4;
                }
                else if (randomNumber >= 84 && randomNumber <= 96) {
                    randomLevel = 5;
                }
                else {
                    randomLevel = 6;
                }
            }
            while (completedRandomLevels[randomLevel] == 1);
        }
        else {
            randomLevel = 99;
        }
        currentScoreLabel.text = "Your current score:\n\n" + score;
        finalScoreLabel.text = "Your final score:\n\n" + score;
        changeStoryText();
        changeHelpText();
        cannon.tint = 0x33FF00;
        cannon.alpha = 1.0;
        clearScene.visible = true;
        gameScene.visible = false;
    }
}

// The following functions are used to load in spritesheets and create them when they are called.
function loadOctopus() {
    let octopus = PIXI.BaseTexture.from("assets/octopus.png");
    let width = 52;
    let height = 35;
    let numFrames = 2;
    let textures = [];
    for (let i = 0; i < numFrames; i++) {
        // http://pixijs.download/release/docs/PIXI.Texture.html
        let octopusFrame = new PIXI.Texture(octopus, new PIXI.Rectangle(i * width, 0, width, height));
        textures.push(octopusFrame);
    }
    return textures;
}
function createOctopus(x, y) {
    // http://pixijs.download/release/docs/PIXI.AnimatedSprite.html
    let octopus = new PIXI.AnimatedSprite(octopusTexture);
    octopus.anchor.set(.5, .5); // position, scaling, rotating etc are now from center of sprite
    octopus.x = x; // we want the aliens to appear at the specified locations
    octopus.y = y; // ditto
    octopus.rotation = 0;
    octopus.alpha = 1.0;
    octopus.isAlive = true;
    octopus.animationSpeed = 1 / 10;
    octopus.loop = true;
    aliens.push(octopus);
    gameScene.addChild(octopus);
    octopus.play();
}
function loadCrabs() {
    let crab = PIXI.BaseTexture.from("assets/crab.png");
    let width = 48;
    let height = 36;
    let numFrames = 2;
    let textures = [];
    for (let i = 0; i < numFrames; i++) {
        // http://pixijs.download/release/docs/PIXI.Texture.html
        let crabFrame = new PIXI.Texture(crab, new PIXI.Rectangle(i * width, 0, width, height));
        textures.push(crabFrame);
    }
    return textures;
}
function createCrab(x, y) {
    // http://pixijs.download/release/docs/PIXI.AnimatedSprite.html
    let crab = new PIXI.AnimatedSprite(crabTexture);
    crab.anchor.set(.5, .5); // position, scaling, rotating etc are now from center of sprite
    crab.x = x; // we want the aliens to appear at the specified locations
    crab.y = y; // ditto
    crab.rotation = 0;
    crab.alpha = 1.0;
    crab.isAlive = true;
    crab.animationSpeed = 1 / 10;
    crab.loop = true;
    aliens.push(crab);
    gameScene.addChild(crab);
    crab.play();
}
function loadSquids() {
    let squid = PIXI.BaseTexture.from("assets/squid.png");
    let width = 35;
    let height = 35;
    let numFrames = 2;
    let textures = [];
    for (let i = 0; i < numFrames; i++) {
        // http://pixijs.download/release/docs/PIXI.Texture.html
        let squidFrame = new PIXI.Texture(squid, new PIXI.Rectangle(i * width, 0, width, height));
        textures.push(squidFrame);
    }
    return textures;
}
function createSquid(x, y) {
    // http://pixijs.download/release/docs/PIXI.AnimatedSprite.html
    let squid = new PIXI.AnimatedSprite(squidTexture);
    squid.anchor.set(.5, .5); // position, scaling, rotating etc are now from center of sprite
    squid.x = x; // we want the aliens to appear at the specified locations
    squid.y = y; // ditto
    squid.rotation = 0;
    squid.alpha = 1.0;
    squid.isAlive = true;
    squid.animationSpeed = 1 / 10;
    squid.loop = true;
    aliens.push(squid);
    gameScene.addChild(squid);
    squid.play();
}
function loadAlienLasers() {
    let laser = PIXI.BaseTexture.from("assets/alienLaser.png");
    let width = 6;
    let height = 18;
    let numFrames = 2;
    let textures = [];
    for (let i = 0; i < numFrames; i++) {
        // http://pixijs.download/release/docs/PIXI.Texture.html
        let laserFrame = new PIXI.Texture(laser, new PIXI.Rectangle(i * width, 0, width, height));
        textures.push(laserFrame);
    }
    return textures;
}
function createLaser(x, y, rotation) {
    // http://pixijs.download/release/docs/PIXI.AnimatedSprite.html
    let laser = new PIXI.AnimatedSprite(laserTexture);
    laser.anchor.set(.5, .5); // position, scaling, rotating etc are now from center of sprite
    laser.x = x; // we want the lasers to appear at the specified locations
    laser.y = y; // ditto
    laser.rotation = rotation;
    laser.isAlive = true;
    laser.animationSpeed = 1 / 4;
    laser.loop = true;
    alienLasers.push(laser);
    gameScene.addChild(laser);
    laser.play();
}
function loadAlienExplosions() {
    let explosion = PIXI.BaseTexture.from("assets/alienExplosion.png");
    let width = 36;
    let height = 36;
    let numFrames = 2;
    let textures = [];
    for (let i = 0; i < numFrames; i++) {
        // http://pixijs.download/release/docs/PIXI.Texture.html
        let explFrame = new PIXI.Texture(explosion, new PIXI.Rectangle(i * width, 0, width, height));
        textures.push(explFrame);
    }
    return textures;
}
function createAlienExplosion(x, y, tint, alpha, size) {
    // http://pixijs.download/release/docs/PIXI.AnimatedSprite.html
    let expl = new PIXI.AnimatedSprite(alienExplosionTexture);
    expl.anchor.set(.5, .5); // position, scaling, rotating etc are now from center of sprite
    expl.x = x; // we want the explosions to appear at the specified locations
    expl.y = y; // ditto
    expl.width = size;
    expl.height = size;
    expl.tint = tint;
    expl.alpha = alpha;
    expl.isAlive = true;
    expl.animationSpeed = 1 / 3;
    expl.loop = false;
    expl.onComplete = function () {
        gameScene.removeChild(expl);
        expl.isAlive = false;
    };
    explosions.push(expl);
    gameScene.addChild(expl);
    expl.zIndex = gameScene.children.length;
    expl.play();
}
function loadPlayerExplosions() {
    let explosion = PIXI.BaseTexture.from("assets/playerExplosion.png");
    let width = 66;
    let height = 66;
    let numFrames = 2;
    let textures = [];
    for (let i = 0; i < numFrames; i++) {
        // http://pixijs.download/release/docs/PIXI.Texture.html
        let explFrame = new PIXI.Texture(explosion, new PIXI.Rectangle(i * width, 0, width, height));
        textures.push(explFrame);
    }
    return textures;
}
function createPlayerExplosion(x, y, tint, loopStart) {
    // http://pixijs.download/release/docs/PIXI.AnimatedSprite.html
    let expl = new PIXI.AnimatedSprite(playerExplosionTexture);
    let loopNumber = loopStart;
    expl.anchor.set(.5, .5); // position, scaling, rotating etc are now from center of sprite
    expl.x = x; // we want the explosions to appear at the specified locations
    expl.y = y; // ditto
    expl.tint = tint;
    expl.isAlive = true;
    expl.animationSpeed = 1 / 3;
    expl.loop = false;
    expl.onComplete = function () {
        if (loopNumber < 8) {
            loopNumber++;
            gameScene.removeChild(expl);
            expl.isAlive = false;
            createPlayerExplosion(x, y, tint, loopNumber);
        }
        else {
            if (lives > 0) {
                gameScene.removeChild(expl);
                expl.isAlive = false;
                if (randomLevel == 0 || randomLevel == 3) {
                    cannon.x = 300;
                    cannon.y = 300;
                }
                else {
                    cannon.x = 300;
                    cannon.y = 550;
                }
                ailmentTimer = 0;
                currentlyDead = false;
                respawn = true;
            }
            else {
                cannon.tint = 0x33FF00;
                end();
            }
        }
    };
    explosions.push(expl);
    gameScene.addChild(expl);
    expl.play();
}
function loadBarrierDestruction() {
    let barrier = PIXI.BaseTexture.from("assets/barrierDestroyed.png");
    let width = 105;
    let height = 79;
    let numFrames = 8;
    let textures = [];
    for (let i = 0; i < numFrames; i++) {
        // http://pixijs.download/release/docs/PIXI.Texture.html
        let barrierFrame = new PIXI.Texture(barrier, new PIXI.Rectangle(i * width, 0, width, height));
        textures.push(barrierFrame);
    }
    return textures;
}
function createBarrierDestruction(x, y, tint) {
    // http://pixijs.download/release/docs/PIXI.AnimatedSprite.html
    let barrier = new PIXI.AnimatedSprite(barrierDestructionTexture);
    barrier.anchor.set(.5, .5); // position, scaling, rotating etc are now from center of sprite
    barrier.x = x; // we want the objects to appear at the specified locations
    barrier.y = y; // ditto
    barrier.tint = tint;
    barrier.isAlive = true;
    barrier.animationSpeed = 1 / 3;
    barrier.loop = false;
    barrier.onComplete = function () { gameScene.removeChild(barrier); barrier.isAlive = false; };
    explosions.push(barrier);
    gameScene.addChild(barrier);
    barrier.play();
}
function loadHealthBar() {
    let health = PIXI.BaseTexture.from("assets/healthBar.png");
    let width = 300;
    let height = 15;
    let numFrames = 301;
    let textures = [];
    for (let i = 0; i < numFrames; i++) {
        // http://pixijs.download/release/docs/PIXI.Texture.html
        let healthFrame = new PIXI.Texture(health, new PIXI.Rectangle(0, i * height, width, height));
        textures.push(healthFrame);
    }
    return textures;
}
function loadBossBizarro() {
    let boss = PIXI.BaseTexture.from("assets/bossImage.png");
    let width = 300;
    let height = 225;
    let numFrames = 2;
    let textures = [];
    for (let i = 0; i < numFrames; i++) {
        // http://pixijs.download/release/docs/PIXI.Texture.html
        let bossFrame = new PIXI.Texture(boss, new PIXI.Rectangle(i * width, 0, width, height));
        textures.push(bossFrame);
    }
    return textures;
}
function loadCharge() {
    let asset = PIXI.BaseTexture.from("assets/charge.png");
    let width = 55;
    let height = 55;
    let numFrames = 3;
    let textures = [];
    for (let i = 0; i < numFrames; i++) {
        // http://pixijs.download/release/docs/PIXI.Texture.html
        let assetFrame = new PIXI.Texture(asset, new PIXI.Rectangle(i * width, 0, width, height));
        textures.push(assetFrame);
    }
    return textures;
}
function createCharge(x, y, tint) {
    // http://pixijs.download/release/docs/PIXI.AnimatedSprite.html
    let chargeAnimation = new PIXI.AnimatedSprite(chargeTexture);
    chargeAnimation.anchor.set(.5, .5); // position, scaling, rotating etc are now from center of sprite
    chargeAnimation.x = x; // we want the objects to appear at the specified locations
    chargeAnimation.y = y; // ditto
    chargeAnimation.alpha = 0.0;
    chargeAnimation.tint = tint;
    chargeAnimation.isAlive = true;
    chargeAnimation.animationSpeed = 1 / 6;
    chargeAnimation.loop = true;
    charge = chargeAnimation;
    bossElements.push(charge);
    gameScene.addChild(charge);
    charge.play();
}
function loadSteam() {
    let steam = PIXI.BaseTexture.from("assets/steamStart.png");
    let width = 60;
    let height = 20;
    let numFrames = 5;
    let textures = [];
    for (let i = 0; i < numFrames; i++) {
        // http://pixijs.download/release/docs/PIXI.Texture.html
        let steamFrame = new PIXI.Texture(steam, new PIXI.Rectangle(0, i * height, width, height));
        textures.push(steamFrame);
    }
    return textures;
}
function createSteam(x, y, rotation) {
    // http://pixijs.download/release/docs/PIXI.AnimatedSprite.html
    let steam = new PIXI.AnimatedSprite(steamStartTexture);
    steam.anchor.set(.5, .5); // position, scaling, rotating etc are now from center of sprite
    steam.x = x; // we want the objects to appear at the specified locations
    steam.y = y; // ditto
    steam.rotation = rotation;
    steam.width = 120;
    steam.height = 40;
    steam.isAlive = true;
    steam.animationSpeed = 1 / 3;
    steam.loop = false;
    steam.onComplete = function () { createSteamLoop(x, y, rotation); steam.isAlive = false; gameScene.removeChild(steam); };
    gameScene.addChild(steam);
    steam.play();
}
function loadSteamLoop() {
    let steam = PIXI.BaseTexture.from("assets/steamLoop.png");
    let width = 60;
    let height = 20;
    let numFrames = 2;
    let textures = [];
    for (let i = 0; i < numFrames; i++) {
        // http://pixijs.download/release/docs/PIXI.Texture.html
        let steamFrame = new PIXI.Texture(steam, new PIXI.Rectangle(0, i * height, width, height));
        textures.push(steamFrame);
    }
    return textures;
}
function createSteamLoop(x, y, rotation) {
    // http://pixijs.download/release/docs/PIXI.AnimatedSprite.html
    let steam = new PIXI.AnimatedSprite(steamLoopTexture);
    steam.anchor.set(.5, .5); // position, scaling, rotating etc are now from center of sprite
    steam.x = x; // we want the object to appear at the specified locations
    steam.y = y; // ditto
    steam.rotation = rotation;
    steam.width = 120;
    steam.height = 40;
    steam.alpha = 1.0;
    steam.isAlive = true;
    steam.animationSpeed = 1 / 3;
    steam.loop = true;
    steamFumes.push(steam);
    gameScene.addChild(steam);
    steam.play();
}