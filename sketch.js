let MENU = 0
let MOVE_INTERVAL = 30;
//how long it takes for envelopes to move
const SHOT_PAUSE = 300;

const scale = 3; // scales my images up by 3

let envs = [];
let shots = [];

let player; // player
let loveImg; // open love letter
let heartImg; // broken heart
let envImg, bowImg, arrowImg; // envelope, cupids bow(shooter), arrow (shots)

let frameCount = 0; // allows movement by progressing time
let envSpeed = 1; // speed for envelopes/open letters/hearts movement

let score, win; // score and win

let reveals = []; // means that either a heart or an open letter can be randomly generated

function preload() {
	envImg = loadImage("env.png"); // envelope
	bowImg = loadImage("bow.png"); // cupid's bow, the 'spaceship'
	arrowImg = loadImage("arrow.png"); // arrow
	howtoImg = loadImage("howto.png"); // instructions 
	startImg = loadImage("startpage.png"); //loadiing screen

	loveImg = loadImage("love.png"); // open envelope (NOT MEANT TO SHOOT AT THIS, -VE POINTS)
    heartImg = loadImage("heart.png"); // broken heart (SHOOT, +VE POINTS)
	reveals = [loveImg, heartImg]; // array for random heart or envelope
}

function setup() {
	createCanvas(Math.min(500, window.innerWidth), Math.min(500, window.innerWidth)); // setting canvas
	noSmooth();

	//create envelopes setting height etc
	
	let envWidth = scale * envImg.width,
		envHeight = scale * envImg.height;

	let x = -(scale * 5 + envWidth) + scale,
		y = scale,
		yidx = 0;
	for (let i = 0; i < 9 * 4; ++i) {
		x += scale * 5 + envWidth;
		if (x >= width - envWidth * 3) {
			y += scale * 5 + envHeight;
			yidx++;
			x = scale;
		}
		envs.push(new env(x, y, envWidth, envHeight, (yidx % 2 == 0) ? envImg : envImg));
		//i struggled with this bit due to not initially having a sprite.js folder, but this should now be working
	}
		

	//create player
	player = new Player(width / 2, height - bowImg.height * scale, bowImg.width * scale, bowImg.height * scale, bowImg);
	score = 0;
	win = false;

	MOVE_INTERVAL = 30;

	loop();
}

function draw() {

	//making the start page, with options to start game or go to instructions.
	//start page works as expected other than start button?
	if (MENU == 0) {
		//  MENU
		print(mouseX, mouseY)
		background(237, 97, 145);

		fill(250, 180, 204);
		textSize(30);
		text('yours, cupid', 185, 355);
		
		image(startImg, 55, 0, 400, 400)
	  
		noStroke();
		fill(250, 180, 204); 
		rect(265, 400, 200, 75, 20); // making two rectangles on the loading screen which can act as buttons 
		noStroke();
		fill(250, 180, 204); 
		rect(35, 400, 200, 75, 20); // the fifth term in these dimensions changes the radius of the shape, to make it a curved rectangle
	  
		fill(255);
		textSize(26)
		text('start game', 78, 447); // start button text
	  
		textSize(26);
		text('how to play', 298, 447); // instructions page button text
	}

	if (MENU == 1) { // START GAME 
		background(255, 255, 255)
		gameDraw(); // start the game
	} 
	if (MENU == 2) { // INSTRUCTIONS
		image(howtoImg, 0, 0, 500, 500) // instructions page image
	
		textSize(20)
		text('Press esc to return to menu', 205, 20) //now working
	
		
		if (keyCode == ESCAPE) { 
		  MENU = 0

		}
	}
}

function gameDraw() {
//gameDraw function may not be being called properly but no error showing in debugger, don't know how to fix (ERROR SOLVED)

	frameCount++; // pass time

    if(mouseIsPressed) {
        move();
    }
	if (keyIsDown(LEFT_ARROW)) { // should make bow move left
		player.move(-scale);
	} else if (keyIsDown(RIGHT_ARROW)) { // should make bow move right
		player.move(scale);
	}
	player.update(frameCount);

	let notWon = false; 
	for (let env of envs) {
		env.update(frameCount);
		shots.forEach(shot => {
			if (shot.intersects(env) && env.deadMarked != true) { 
				shot.deadMarked = true;
				MOVE_INTERVAL -= 0.1;

				if (env.img == envImg) {
					env.img = random(reveals); // reveals a broken heart OR open love letter
					
					if (env.img == loveImg) { 
						env.vel.x = -env.vel.x;
					}
					
				} else if (env.img == loveImg) { // decrease score if love letter hit
					score -= floor((1 / MOVE_INTERVAL) * 300);
					env.deadMarked = true;

				} else if (env.img == heartImg) { // increase score if broken heart hit
					score += floor((1 / MOVE_INTERVAL) * 300 );
					env.deadMarked = true;
				}
			}
		});

		if (!env.deadMarked && env.img != loveImg) {
			notWon = true;
		}
	}

	if (!notWon) { 
		win = true;
	}

	for (let shot of shots) {
		shot.update(frameCount); // update shots for movement
	}
	if (envs.some(env => env.right() >= width || env.left() <= 0)) { 
		envs.forEach(env => {
			env.pos.add(p5.Vector.mult(env.vel, -1));
			env.vel.x = -env.vel.x;
			if (env.img == loveImg) {
				env.pos.y -= scale * 10;

			} else {
				env.pos.y += scale * 5;
			}
		});
	}

	//deletion of arrows and envelopes
	shots = shots.filter(shot => !shot.deadMarked && shot.lower() >= 0);
	envs = envs.filter(env => !env.deadMarked);

	//draw

	for (let env of envs) {
		env.draw();
	}
	for (let shot of shots) {
		shot.draw();
	}
	player.draw();

	noStroke();
	textSize(28);
	textAlign(RIGHT, TOP);
	fill(win ? 0 : 0, 0, win ? 0 : 0)
	text(`${score}`, width, 0);

	if (win) {
		textAlign(RIGHT, TOP);

		textAlign(CENTER, CENTER);
		textSize(35);
		text("well done! SCORE:" + `${score}`, width / 2, height / 2); //message that displays at the end

		noLoop();
	}
}

// allows player to shoot when up pressed
function keyPressed() {
	if (keyCode === UP_ARROW) {
		player.shoot();
	}
}

// mouse controls
function move() {
	if (mouseY < height/2) {
		player.shoot();
	} else if(mouseX > width/2) {
		player.move(scale);
	} else if(mouseX < width/2) {
		player.move(-scale);
	}
}

function mouseClicked() {
	if (MENU == 0) {
	  if (mouseY < 475 && mouseY > 400) {
		if (mouseX < 235 && mouseX > 35) {
		  MENU = 1
		}
		if (mouseX < 465 && mouseX > 265) {
		  MENU = 2
		}
	  }
	}
}

function mousePressed() {
	return false;
}

function mouseDragged() {
	return false;
}

//allows arrows to be spawned and controls their bindings
function createShot(x, y) {
	shotPrefab = new Sprite(x, y, arrowImg.width * scale, arrowImg.height * scale, arrowImg);
	shotPrefab.vel = createVector(0, -scale * 2);
	shotPrefab.deadMarked = false;
	shotPrefab.update = function updateShot(frameCount) {
		this.pos.add(this.vel);
	}
	return shotPrefab;
}

const sign = n => n > 0 ? 1 : n === 0 ? 0 : -1;