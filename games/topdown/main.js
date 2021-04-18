import { InputController } from "../../modules/inputController.js";

/** GLOBALS */

// Document Elements
var canvas = document.getElementById("board");
var context = canvas.getContext("2d");

// Game Objects
var inputController = new InputController();
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
    fps: 60,
  };
  usr = {};
  pc = {};
}

function startGame() {
  // attach inputs to event listenters
  inputController.attachListeners();
  // run game
  setInterval(gameLoop, 1000 / game.fps);
}

function gameLoop() {
  // TODO
}
