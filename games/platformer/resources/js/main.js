/*
 * Jumpman Source Code
 * Adam Coscia
 * 05/29/2020
 */

const NPLATS = 10; // number of platforms to create
const BOARDW = 600; // width of game board
const BOARDH = 480; // height of game board
var t; // timer for updating player position/velocity
var player; // player attributes
var onGround; // on ground flag
var holdLeft; // held keystroke flag
var holdRight; // held keystroke flag
var holdDown; // held keystroke flag
var ctx; // drawing context variable
var levelNum; // level number
var goal; // attributes of the goal
var elapsedTime; // current timestamp from when game started
var bestTime; // shortest time taken to reach goal
var t0; // initial time

function main() {
  t = 0;
  onGround = holdLeft = holdRight = holdDown = false;
  if (document.getElementById("canvas") == undefined) {
    // game needs to be started
    levelNum = 1; // set to first level
    bestTime = 100000; // set best time ridiculously high
    updatePageElements(); // Update existing page elements
    createNewElements(); // Create new doc elements
    window.scrollBy(0, 190); // move screen down to see the game board
    loadAssets(); // Load the art assets
    enableEvents(); // set event listeners to listen
    setInterval(update, 1000 / 30); // start game loop
  }
  loadLevelData(); // loads platforms and player data
  t0 = performance.now(); // get starting time
}

function update() {
  t++; // increment time counter every frame.
  onGround = false; // always assume player is not on the ground
  updatePlayerX(); // update player's x position and velocity
  updatePlayerY(); // update player's y position and velocity
  elapsedTime = performance.now() - t0; // clock elapsed time
  detectCollisions(); // Check for collision with platforms and update sprites
  drawEnv(); // draw the sprites in the environment
  updateStats(); // update stat block
}

/**
 * Returns random integer between min and max, inclusive
 * @return {number}     Random int
 */
function getRndInteger(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}

/**
 * Updates existing index page elements.
 */
function updatePageElements() {
  document.getElementById("playbutton").innerHTML = "Reload";
  document.getElementById("index").innerHTML = "Let's Go!";
}

/**
 * Create new canvas elements and place onto page.
 */
function createNewElements() {
  // create the game board
  let canvas = document.createElement("canvas");
  canvas.id = "canvas";
  canvas.width = BOARDW;
  canvas.height = BOARDH;
  canvas.className = "rounded-lg";
  document.getElementById("board").appendChild(canvas);
  ctx = canvas.getContext("2d"); // get drawing context
  // create the stat columns
  let statCol1 = document.createElement("div");
  statCol1.id = "statcol1";
  statCol1.className = "col text-center align-items-center";
  let statCol2 = document.createElement("div");
  statCol2.id = "statcol2";
  statCol2.className = "col text-center align-items-center";
  let statCol3 = document.createElement("div");
  statCol3.id = "statcol3";
  statCol3.className = "col text-center align-items-center";
  let statCol4 = document.createElement("div");
  statCol4.id = "statcol4";
  statCol4.className = "col text-center align-items-center";
  // create stat visuals
  let stat1 = document.createElement("div");
  stat1.id = "level";
  stat1.className = "p-1 bg-info text-white text-center rounded-lg";
  stat1.innerHTML = "Level " + levelNum;
  let stat2 = document.createElement("div");
  stat2.id = "elapsedTime";
  stat2.className = "p-1 bg-info text-white text-center rounded-lg";
  stat2.innerHTML = "Time: 0.0s";
  let stat3 = document.createElement("div");
  stat3.id = "prevTime";
  stat3.className = "p-1 bg-info text-white text-center rounded-lg";
  stat3.innerHTML = "Prev: 0.0s";
  let stat4 = document.createElement("div");
  stat4.id = "bestTime";
  stat4.className = "p-1 bg-info text-white text-center rounded-lg";
  stat4.innerHTML = "Best: 0.0s";
  // append children to document
  statCol1.appendChild(stat1);
  document.getElementById("stats").appendChild(statCol1);
  statCol2.appendChild(stat2);
  document.getElementById("stats").appendChild(statCol2);
  statCol3.appendChild(stat3);
  document.getElementById("stats").appendChild(statCol3);
  statCol4.appendChild(stat4);
  document.getElementById("stats").appendChild(statCol4);
}

/**
 * Loads art assets into memory.
 */
function loadAssets() {
  const path = "resources/images/"; // image folder
  // defines the asset name and file name of art being used
  let resources = {
    bkg: "backgrounds/dungeon-wall.png",
    ldg: "objects/ledge.png",
    plyStLf: "player/player-standing-left.png",
    plJmLf: "player/player-jumping-left.png",
    plyFlLf: "player/player-falling-left.png",
    plyStRg: "player/player-standing-right.png",
    plyJmRg: "player/player-jumping-right.png",
    plyFlRg: "player/player-falling-right.png",
  };
  art_book = {}; // hold image objects
  for (const [asset, file] of Object.entries(resources)) {
    let x = new Image(); // create new image object
    x.src = path + file; // set filepath of that image
    art_book[asset] = x; // store image in art_book by asset name
  }
}

/**
 * Collects references to and sets game mechanics to run.
 */
function enableEvents() {
  document.addEventListener("keyup", keyUp);
  document.addEventListener("keydown", keyDown);
}

/**
 * Creates list of platform objects for player to stand on.
 */
function loadLevelData() {
  let filePath = "resources/data/level/lvl" + levelNum + ".json";
  var rawFile = new XMLHttpRequest();
  rawFile.open("GET", filePath, false);
  rawFile.onreadystatechange = function () {
    if (rawFile.readyState === 4) {
      if (rawFile.status === 200 || rawFile.status == 0) {
        result = JSON.parse(rawFile.responseText);
        player = result.player;
        plat = result.platforms;
        goalPlatNum = result.goalPlatformNumber;
      }
    }
  };
  rawFile.send(null);
  // Rest of platforms are randomly generated
  for (i = 0; i < NPLATS - 1; i++) {
    plat.push({
      x: getRndInteger(5, BOARDW - 105),
      y: getRndInteger(20, BOARDH - 20),
      w: getRndInteger(95, 100),
      h: 20,
    });
  }
  // set goal location object
  goal = {
    x: plat[goalPlatNum].x + plat[goalPlatNum].w / 2,
    y: plat[goalPlatNum].y,
    w: player.w,
    h: player.h,
  };
}

/**
 * Updates player's x position and velocity.
 */
function updatePlayerX() {
  if (holdLeft) {
    player.vx = -3;
  } else if (holdRight) {
    player.vx = 3;
  }
  player.x += player.vx;
  if (player.x < 0) {
    // Check for wrapping
    player.x = BOARDW;
  } else if (player.x > BOARDW) {
    player.x = 0;
  }
}

/**
 * Updates player's y position and velocity.
 */
function updatePlayerY() {
  if (t < -3) {
    // exponentially increase negative velocity to slow down
    player.vy = -10 / (1 + Math.exp((t + 7) / 3)); // logistic curve, min -10
  } else if (t >= -3 && t <= 3) {
    // linearly increase speed from negative to positive
    player.vy = 0.7 * t; // linear approximation
  } else if (t > 3) {
    //  exponentially decay growth of positive velocity to reach terminal v
    player.vy = 10 / (1 + Math.exp((-t + 7) / 3)); // logistic curve, max 10
  }
  player.y += player.vy;
  if (player.y < 0) {
    // Check for wrapping
    player.y = BOARDH;
  } else if (player.y > BOARDH) {
    player.y = 0;
  }
}

/**
 * Detects and responds to collision detection on the game board.
 */
function detectCollisions() {
  // check for collision with goal
  if (
    player.x >= goal.x - goal.w / 2 - player.w / 2 &&
    player.x <= goal.x - goal.w / 2 + goal.w + player.w / 2 &&
    player.y >= goal.y - goal.h &&
    player.y <= goal.y + player.h
  ) {
    levelNum = 2;
    document.getElementById("level").innerHTML = "Level " + levelNum;
    if (bestTime > elapsedTime) {
      document.getElementById("bestTime").innerHTML =
        "Best: " + (Math.floor(elapsedTime / 100) / 10).toFixed(1) + "s";
      bestTime = elapsedTime;
    }
    document.getElementById("prevTime").innerHTML =
      "Prev: " + (Math.floor(elapsedTime / 100) / 10).toFixed(1) + "s";
    main();
  }
  // check for collision with any platform
  for (i = 0; i < NPLATS; i++) {
    if (
      player.vy > 0 &&
      player.x > plat[i].x &&
      player.x < plat[i].x + plat[i].w &&
      player.y > plat[i].y &&
      player.y < plat[i].y + plat[i].h
    ) {
      // player has fallen onto a platform
      t = 0;
      player.y = plat[i].y;
      onGround = true;
    } else {
      // TODO
    }
  }
  // Update player movement based on status of collision
  if (onGround) {
    // apply horizontal friction
    if (Math.abs(player.vx) > 0.1) {
      player.vx = player.vx * 0.7;
    } else {
      player.vx = 0;
    }
    // teleport player underneath platform
    if (holdDown) {
      player.y += 15;
      t = 7;
      player.vy = -10 / (1 + Math.exp((t + 7) / 3)); // logistic curve
      onGround = false;
    }
  } else {
    // apply horizontal air resistance
    if (Math.abs(player.vx) > 0.1) {
      player.vx = player.vx * 0.95;
    } else {
      player.vx = 0;
    }
  }
}

/**
 * Draws the sprites in the environment.
 */
function drawEnv() {
  // draw dungeon wall
  art_book["bkg"].onload = drawBKG(art_book["bkg"]);

  // draw goal
  ctx.fillStyle = "cyan";
  ctx.fillRect(goal.x - goal.w / 2, goal.y - goal.h, goal.w, goal.h);

  // draw goal
  ctx.fillStyle = "lime";
  ctx.fillRect(
    player.x - player.w / 2,
    player.y - player.h,
    player.w,
    player.h
  );

  /*
  // determine if player is moving horizontally
  if (player.vx > 0) {
    player.facing == "right";
  } else if (player.vy < 0) {
    player.facing == "left";
  }

  // draw player
  if (player.facing == "right") {
    if (player.vy > 1) {
      art_book["plyJR"].onload = drawOBJ(
        art_book["plyJR"],
        player.x - player.w / 2,
        player.y - player.h,
        player.w,
        player.h
      );
    } else if (player.vy < 0) {
      art_book["plyFR"].onload = drawOBJ(
        art_book["plyFR"],
        player.x - player.w / 2,
        player.y - player.h,
        player.w,
        player.h
      );
    }
  }
  */

  // draw platforms
  for (i = 0; i < NPLATS; i++) {
    art_book["ldg"].onload = drawOBJ(
      art_book["ldg"],
      plat[i].x,
      plat[i].y,
      plat[i].w,
      plat[i].h
    );
  }
}

function drawBKG(img) {
  ctx.drawImage(img, 0, 0);
}

function drawOBJ(img, dx, dy, dWidth, dHeight) {
  ctx.drawImage(img, dx, dy, dWidth, dHeight);
}

/**
 * Updates stat block below game board.
 */
function updateStats() {
  document.getElementById("elapsedTime").innerHTML =
    "Time: " + (Math.floor(elapsedTime / 100) / 10).toFixed(1) + "s";
}

/**
 * Defines game rules based on pressing key.
 * @param {Event} evt
 */
function keyDown(evt) {
  evt.preventDefault();
  switch (evt.keyCode) {
    case 37: // Left Key
      holdLeft = true;
      break;
    case 38: // Up Key
      if (onGround) {
        t = -15;
        player.vy = -10 / (1 + Math.exp((t + 7) / 3)); // logistic curve
        onGround = false;
      }
      break;
    case 39: // Right Key
      holdRight = true;
      break;
    case 40: // Down Key
      holdDown = true;
  }
}

/**
 * Defines game rules based on depressing key.
 * @param {EVENT} evt
 */
function keyUp(evt) {
  evt.preventDefault();
  switch (evt.keyCode) {
    case 37: // Left Key
      holdLeft = false;
      break;
    case 38: // Up Key
      if (t >= -15 && t <= -13) {
        t = -3; // reduce speed drastically (quick hop)
      } else if (t >= -12 && t <= -9) {
        t = -5; // reduce speed (hop)
      }
      break;
    case 39: // Right Key
      holdRight = false;
      break;
    case 40: // Down Key
      holdDown = false;
      break;
  }
}
