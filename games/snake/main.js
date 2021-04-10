/** GLOBALS */

// Document Elements
var stateButton = document.getElementById("stateButton");
var scoreOutput = document.getElementById("scoreOutput");
var difficultyOutput = document.getElementById("difficultyOutput");
var difficultySlider = document.getElementById("difficultySlider");
difficultySlider.oninput = function () {
  setDifficulty(this.value);
};
var canvas = document.getElementById("board");
var CTX = canvas.getContext("2d");

// Game Objects
var gameTimer = false; // Holds interval that runs game.
var player; // Player properties
var apple; // Apple properties
var conf; // Game properties

// Window events
window.onload = function () {
  setCanvas(); // set canvas size and style
  setDefaults(); // initialize game objects
};
window.onresize = function () {
  location.reload(); // refresh the entire page
};

/** FUNCTIONS */

function setCanvas() {
  // width x height
  canvas.width = Math.floor(Math.min(window.innerWidth - canvas.parentNode.clientWidth, window.innerHeight - 84));
  canvas.height = canvas.width; // keep the board square!
  // style the canvas
  canvas.style.background = "black";
  canvas.style.border = "5px solid gray";
}

function clearCanvas() {
  CTX.clearRect(0, 0, canvas.width, canvas.height);
  canvas.style.background = "black";
  canvas.style.border = "5px solid gray";
}

function setDifficulty(difficulty) {
  switch (difficulty) {
    case "1":
      difficultyOutput.innerHTML = "Normal";
      conf.gameSpeed = 200; // 1x speed
      break;
    case "2":
      difficultyOutput.innerHTML = "Hard";
      conf.gameSpeed = 150; // 1.5x speed
      break;
    case "3":
      difficultyOutput.innerHTML = "Good Luck";
      conf.gameSpeed = 100; // 2x speed
      break;
  }
  if (gameTimer && gameTimer !== "gameover") {
    clearInterval(gameTimer);
    gameTimer = false;
    gameTimer = setInterval(game, conf.gameSpeed);
  }
}

function setDefaults() {
  conf = {
    score: 0, // number of apples eaten
    gameSpeed: 200, // ms between draw events => lower to make harder
    tileCount: 20, // The number of tiles in a row or column.
    tileWidth: canvas.width / 20, // Tile width on the canvas in pixels.
    tileHeight: canvas.height / 20, // Tile height on the canvas in pixels.
  };
  player = {
    vx: 1, // Player x velocity in tiles per tick.
    vy: 0, // Player y velocity in tiles per tick.
    head: {
      x: Math.floor(conf.tileCount / 2), // Player position relative to number of tiles in a row or column.
      y: Math.floor(conf.tileCount / 2), // Player position relative to number of tiles in a row or column.
    },
    tail: {
      nodes: [], // Stores the previous head positions to draw the tail.
      maxLength: 4, // tail length NOT including the head of the snake at (player.head.x, player.head.y).
    },
    oob: function () {
      this.head.x == -1 || this.head.x == conf.tileCount || this.head.y == -1 || this.head.y == conf.tileCount;
    },
  };
  apple = {
    x: 0, // Apple x position relative to number of tiles in a row or column.
    y: 0, // Apple y position relative to number of tiles in a row or column.
  };
}

function startGame() {
  // set default values for game objects and outputs
  setDefaults();
  setDifficulty(difficultySlider.value);
  scoreOutput.innerHTML = conf.score;
  // clear the canvas for drawing
  clearCanvas();
  // Draw the head of the snake.
  CTX.beginPath();
  CTX.fillStyle = "lime";
  CTX.fillRect(player.head.x * conf.tileWidth, player.head.y * conf.tileHeight, conf.tileWidth, conf.tileHeight);
  // Draw First Apple.
  drawApple();
  // Give the game direction control.
  document.addEventListener("keydown", keyPush);
  document.getElementById("leftarrow").addEventListener("click", onPressLeft);
  document.getElementById("uparrow").addEventListener("click", onPressUp);
  document.getElementById("rightarrow").addEventListener("click", onPressRight);
  document.getElementById("downarrow").addEventListener("click", onPressDown);
  // Set game timer.
  gameTimer = setInterval(game, conf.gameSpeed);
  // Set stateButton to Pause
  stateButton.innerHTML = "Pause";
  stateButton.onclick = pauseGame;
}

function pauseGame() {
  stateButton.innerHTML = "Continue";
  stateButton.onclick = continueGame;
  clearInterval(gameTimer);
  gameTimer = false;
}

function continueGame() {
  stateButton.innerHTML = "Pause";
  stateButton.onclick = pauseGame;
  gameTimer = setInterval(game, conf.gameSpeed);
}

function gameOver() {
  stateButton.innerHTML = "Play Again?";
  stateButton.onclick = startGame;
  clearInterval(gameTimer);
  gameTimer = "gameover";
  alert("Game Over!");
}

function onPressLeft() {
  if (gameTimer && player.vx != 1) {
    player.vx = -1;
    player.vy = 0;
  }
}

function onPressUp() {
  if (gameTimer && player.vy != 1) {
    player.vx = 0;
    player.vy = -1;
  }
}

function onPressRight() {
  if (gameTimer && player.vx != -1) {
    player.vx = 1;
    player.vy = 0;
  }
}

function onPressDown() {
  if (gameTimer && player.vy != -1) {
    player.vx = 0;
    player.vy = 1;
  }
}

function keyPush(event) {
  event.preventDefault();
  switch (event.keyCode) {
    case 32: // spacebar
      if (gameTimer == "gameover") {
        startGame();
        break;
      } else if (gameTimer) {
        pauseGame();
        break;
      } else {
        continueGame();
        break;
      }
    case 37: // The left key.
      onPressLeft();
      break;
    case 38: // The top key.
      onPressUp();
      break;
    case 39: // The right key.
      onPressRight();
      break;
    case 40: // The bottom key.
      onPressDown();
      break;
  }
}

function game() {
  // Add previous head position to the beginning of tail nodes.
  player.tail.nodes.unshift({
    x: player.head.x,
    y: player.head.y,
  });

  // Move snake head forward.
  player.head.x += player.vx;
  player.head.y += player.vy;

  // If snake head goes out of the game screen, clear the game timer and alert the player.
  if (player.oob()) {
    gameOver();
    return;
  }

  // If snake head touches its tail, clear the game timer and alert the player.
  for (i = 0; i < player.tail.nodes.length; i++) {
    if (player.head.x == player.tail.nodes[i].x && player.head.y == player.tail.nodes[i].y) {
      gameOver();
      return;
    }
  }

  // If snake touches the apple, move the apple to a random location, draw it,
  // and make the maxLength longer.
  if (player.head.x == apple.x && player.head.y == apple.y) {
    drawApple();
    conf.score++;
    player.tail.maxLength++;
    scoreOutput.innerHTML = conf.score;
  }

  // Draw the new head of the snake.
  CTX.beginPath();
  CTX.fillStyle = "lime";
  CTX.fillRect(player.head.x * conf.tileWidth, player.head.y * conf.tileHeight, conf.tileWidth, conf.tileHeight);

  // If the number of positions in the tail is longer than the tail length, remove the last position.
  if (player.tail.nodes.length > player.tail.maxLength) {
    clearTailEnd();
  }
}

function drawApple() {
  // Check if the apple is not being drawn on top of the snake.
  var redraw = true;
  while (redraw) {
    apple.x = Math.floor(Math.random() * (conf.tileCount - 1) + 1);
    apple.y = Math.floor(Math.random() * (conf.tileCount - 1) + 1);
    redraw = false;
    if (apple.x == player.head.x && apple.y == player.head.y) {
      // apple is drawn on top of player head
      redraw = true;
    } else {
      for (i = 0; i < player.tail.nodes.length; i++) {
        if (apple.x == player.tail.nodes[i].x && apple.y == player.tail.nodes[i].y) {
          // apple is drawn on one of the tail nodes
          redraw = true;
          break;
        }
      }
    }
  }
  // Draw Apple
  CTX.beginPath();
  CTX.fillStyle = "red";
  CTX.fillRect(apple.x * conf.tileWidth, apple.y * conf.tileHeight, conf.tileWidth, conf.tileHeight);
}

function clearTailEnd() {
  var end = player.tail.nodes.pop(); // Remove last tail segment from the tail positions.
  CTX.beginPath();
  CTX.fillStyle = "black";
  CTX.fillRect(end.x * conf.tileWidth, end.y * conf.tileHeight, conf.tileWidth, conf.tileHeight); // Color it black
}
