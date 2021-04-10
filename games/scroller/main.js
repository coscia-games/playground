/** GLOBALS */

// Document Elements
var canvas = document.getElementById("board");
var context = canvas.getContext("2d");
try {
  var characterX = document.getElementById("characterX");
  var characterY = document.getElementById("characterY");
  var characterVX = document.getElementById("characterVX");
  var characterVY = document.getElementById("characterVY");
} catch (err) {}

// Game Objects
var game; // Game properties
var player; // Player properties
var character; // character properties

// Window events
window.onload = function () {
  setCanvas(); // set canvas size and style
  setDefaults(); // initialize game objects
  startGame(); // start the game
};
window.onresize = function () {
  location.reload(); // refresh the entire page
};

/** FUNCTIONS */

function setCanvas() {
  // width x height
  canvas.width = Math.floor(Math.min(window.innerWidth - canvas.parentNode.clientWidth, window.innerHeight - 24));
  canvas.height = canvas.width * (9 / 16); // Widescreen aspect ratio
  // style the canvas
  canvas.style.border = "5px solid gray";
}

function clearCanvas() {
  context.clearRect(0, 0, canvas.width, canvas.height);
  canvas.style.border = "5px solid gray";
}

function setDefaults() {
  game = {
    fps: 30,
    gravity: 0.6,
    platforms: [],
    ground: canvas.height / 2 + 100,
  };
  player = {
    holdLeft: false,
    holdRight: false,
  };
  character = {
    x: 0,
    y: 0,
    h: 25,
    w: 10,
    vx: 0,
    vy: 0,
    onGround: true,
  };
}

function startGame() {
  // add button controls
  document.addEventListener("keydown", keyDown);
  document.addEventListener("keyup", keyUp);
  document.getElementById("leftarrow").addEventListener("mousedown", onPressLeft);
  document.getElementById("leftarrow").addEventListener("mouseup", onDepressLeft);
  document.getElementById("leftarrow").addEventListener("touchstart", onPressLeft);
  document.getElementById("leftarrow").addEventListener("touchend", onDepressLeft);
  document.getElementById("uparrow").addEventListener("mousedown", onPressUp);
  document.getElementById("uparrow").addEventListener("mouseup", onDepressUp);
  document.getElementById("uparrow").addEventListener("touchstart", onPressUp);
  document.getElementById("uparrow").addEventListener("touchend", onDepressUp);
  document.getElementById("rightarrow").addEventListener("mousedown", onPressRight);
  document.getElementById("rightarrow").addEventListener("mouseup", onDepressRight);
  document.getElementById("rightarrow").addEventListener("touchstart", onPressRight);
  document.getElementById("rightarrow").addEventListener("touchend", onDepressRight);
  // create platforms
  for (i = 0; i < 20; i++) {
    game.platforms.push({
      x: i * 75,
      y: Math.floor(Math.random() * 30) + 20,
      w: Math.floor(Math.random() * (40 - 20 + 1)) + 30,
      h: 10,
    });
  }
  // run game
  setInterval(gameLoop, 1000 / game.fps);
}

function onPressLeft() {
  player.holdLeft = true;
}

function onDepressLeft() {
  player.holdLeft = false;
}

function onPressUp() {
  if (character.onGround) character.vy = 6;
}

function onDepressUp() {
  return;
}

function onPressRight() {
  player.holdRight = true;
}

function onDepressRight() {
  player.holdRight = false;
}

function keyDown(evt) {
  evt.preventDefault();
  switch (evt.keyCode) {
    case 37: // Left key
      onPressLeft();
      break;
    case 38: // Up key
      onPressUp();
      break;
    case 39: // Right key
      onPressRight();
      break;
  }
}

function keyUp(evt) {
  evt.preventDefault();
  switch (evt.keyCode) {
    case 37: // Left key
      onDepressLeft();
      break;
    case 38: // Up key
      onDepressUp();
      break;
    case 39: // Right key
      onDepressRight();
      break;
  }
}

function gameLoop() {
  // Update character x velocity.
  if (player.holdLeft && player.holdRight) {
    character.vy = 0;
  } else if (player.holdLeft) {
    character.vx = -3;
  } else if (player.holdRight) {
    character.vx = 3;
  } else if (character.onGround) {
    character.vx *= 0.8; // slow character down while on ground
  }

  // Update character y velocity.
  if (character.vy > -6) {
    character.vy -= game.gravity;
  } else {
    character.vy = -6; // cap the descent velocity
  }

  // Update character position.
  character.x += character.vx;
  character.y += character.vy;

  // Handle object collision.
  character.onGround = false;
  if (character.y <= 0) {
    // charcter below ground
    character.y = 0;
    character.onGround = true;
  } else {
    for (i = 0; i < game.platforms.length; i++) {
      if (
        character.x > game.platforms[i].x &&
        character.x < game.platforms[i].x + game.platforms[i].w &&
        character.y < game.platforms[i].y &&
        character.y > game.platforms[i].y - game.platforms[i].h
      ) {
        // character inside platform => put them on platform
        character.y = game.platforms[i].y;
        character.vy = 0;
        character.onGround = true;
        break;
      }
    }
  }

  // Update table
  try {
    characterX.innerHTML = character.x.toFixed(1);
    characterY.innerHTML = character.y.toFixed(1);
    characterVX.innerHTML = character.vx.toFixed(1);
    characterVY.innerHTML = character.vy.toFixed(1);
  } catch (err) {}

  // Clear Canvas
  clearCanvas();
  // Draw Character
  context.fillStyle = "red";
  context.fillRect((canvas.width - character.w) / 2, game.ground - character.h, character.w, character.h);
  // Draw Ground
  context.fillStyle = "black";
  context.fillRect(0, game.ground + character.y, canvas.width, canvas.height - (game.ground + character.y));
  // Draw Elements
  context.fillStyle = "green";
  for (i = 0; i < game.platforms.length; i++) {
    context.fillRect(
      canvas.width / 2 + game.platforms[i].x - character.x,
      game.ground + character.y - game.platforms[i].y,
      game.platforms[i].w,
      game.platforms[i].h
    );
  }
}
