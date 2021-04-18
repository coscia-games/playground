/** GLOBALS */

// Document Elements
var canvas = document.getElementById("board");
var context = canvas.getContext("2d");

// Game Objects
var game; // Game properties
var usr; // usr properties
var pc; // pc properties

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
  // Set canvas width and height based on parent node width
  canvas.width = 0.7 * canvas.parentNode.clientWidth;
  canvas.height = canvas.width * (3 / 4); // 4:3 aspect ratio
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
  usr = {
    holdLeft: false,
    holdRight: false,
  };
  pc = {
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
  usr.holdLeft = true;
}

function onDepressLeft() {
  usr.holdLeft = false;
}

function onPressUp() {
  if (pc.onGround) pc.vy = 6;
}

function onDepressUp() {
  return;
}

function onPressRight() {
  usr.holdRight = true;
}

function onDepressRight() {
  usr.holdRight = false;
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
  // Update pc x velocity.
  if (usr.holdLeft && usr.holdRight) {
    pc.vy = 0;
  } else if (usr.holdLeft) {
    pc.vx = -3;
  } else if (usr.holdRight) {
    pc.vx = 3;
  } else if (pc.onGround) {
    pc.vx *= 0.8; // slow pc down while on ground
  }

  // Update pc y velocity.
  if (pc.vy > -6) {
    pc.vy -= game.gravity;
  } else {
    pc.vy = -6; // cap the descent velocity
  }

  // Update pc position.
  pc.x += pc.vx;
  pc.y += pc.vy;

  // Handle object collision.
  pc.onGround = false;
  if (pc.y <= 0) {
    // charcter below ground
    pc.y = 0;
    pc.onGround = true;
  } else {
    for (i = 0; i < game.platforms.length; i++) {
      if (
        pc.x > game.platforms[i].x &&
        pc.x < game.platforms[i].x + game.platforms[i].w &&
        pc.y < game.platforms[i].y &&
        pc.y > game.platforms[i].y - game.platforms[i].h
      ) {
        // pc inside platform => put them on platform
        pc.y = game.platforms[i].y;
        pc.vy = 0;
        pc.onGround = true;
        break;
      }
    }
  }

  // Clear Canvas
  clearCanvas();
  // Draw pc
  context.fillStyle = "red";
  context.fillRect((canvas.width - pc.w) / 2, game.ground - pc.h, pc.w, pc.h);
  // Draw Ground
  context.fillStyle = "black";
  context.fillRect(0, game.ground + pc.y, canvas.width, canvas.height - (game.ground + pc.y));
  // Draw Elements
  context.fillStyle = "green";
  for (i = 0; i < game.platforms.length; i++) {
    context.fillRect(
      canvas.width / 2 + game.platforms[i].x - pc.x,
      game.ground + pc.y - game.platforms[i].y,
      game.platforms[i].w,
      game.platforms[i].h
    );
  }
}
