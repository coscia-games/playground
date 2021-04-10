/** GLOBALS */
import { P3, axoProjMat } from "./draw.js";

// function creates a 3D point (vertex)
function vertex(x, y, z) {
  return { x, y, z };
}
// an array of vertices
const vertices = []; // an array of vertices

// create the 8 vertices that make up a box
const boxSize = 20; // size of the box
const hs = boxSize / 2; // half size shorthand for easier typing
vertices.push(vertex(-hs, -hs, -hs)); // lower top left  index 0
vertices.push(vertex(hs, -hs, -hs)); // lower top right
vertices.push(vertex(hs, hs, -hs)); // lower bottom right
vertices.push(vertex(-hs, hs, -hs)); // lower bottom left
vertices.push(vertex(-hs, -hs, hs)); // upper top left  index 4
vertices.push(vertex(hs, -hs, hs)); // upper top right
vertices.push(vertex(hs, hs, hs)); // upper bottom right
vertices.push(vertex(-hs, hs, hs)); // upper  bottom left index 7

const colours = {
  dark: "#040",
  shade: "#360",
  light: "#ad0",
  bright: "#ee0",
};

function createPoly(indexes, colour) {
  return {
    indexes,
    colour,
  };
}

const polygons = [];

polygons.push(createPoly([1, 2, 6, 5], colours.shade)); // right face
polygons.push(createPoly([2, 3, 7, 6], colours.light)); // front face
polygons.push(createPoly([4, 5, 6, 7], colours.bright)); // top face

class inputController {
  keyMap;
  clickMap;

  constructor() {
    this.keyMap = {};
    this.clickMap = {};
  }

  bind() {
    /**
     * Keyboard inputs.
     */
    this.keyMap = {
      w: {
        code: "KeyW",
        up: () => console.log("keyup > KeyW"),
        down: () => console.log("keydown > KeyW"),
      },
      a: {
        code: "KeyA",
        up: () => console.log("keyup > KeyA"),
        down: () => console.log("keydown > KeyA"),
      },
      s: {
        code: "KeyS",
        up: () => console.log("keyup > KeyS"),
        down: () => console.log("keydown > KeyS"),
      },
      d: {
        code: "KeyD",
        up: () => console.log("keyup > KeyD"),
        down: () => console.log("keydown > KeyD"),
      },
      p: {
        code: "KeyP",
        up: () => console.log("keyup > KeyP"),
        down: () => console.log("keydown > KeyP"),
      },
      " ": {
        code: "Space",
        up: () => console.log("keyup > Space"),
        down: () => console.log("keydown > Space"),
      },
      ArrowLeft: {
        code: "ArrowLeft",
        up: () => console.log("keyup > ArrowLeft"),
        down: () => console.log("keydown > ArrowLeft"),
      },
      ArrowUp: {
        code: "ArrowUp",
        up: () => console.log("keyup > ArrowUp"),
        down: () => console.log("keydown > ArrowUp"),
      },
      ArrowRight: {
        code: "ArrowRight",
        up: () => console.log("keyup > ArrowRight"),
        down: () => console.log("keydown > ArrowRight"),
      },
      ArrowDown: {
        code: "ArrowDown",
        up: () => console.log("keyup > ArrowDown"),
        down: () => console.log("keydown > ArrowDown"),
      },
    };
    /**
     * On-screen click inputs.
     */
    this.clickMap = {
      leftarrow: {
        ref: document.getElementById("leftarrow"),
        press: () => console.log("mousedown touchstart"),
        depress: () => console.log("mouseup touchend"),
      },
      uparrow: {
        ref: document.getElementById("uparrow"),
        press: () => console.log("mousedown touchstart"),
        depress: () => console.log("mouseup touchend"),
      },
      rightarrow: {
        ref: document.getElementById("rightarrow"),
        press: () => console.log("mousedown touchstart"),
        depress: () => console.log("mouseup touchend"),
      },
      downarrow: {
        ref: document.getElementById("downarrow"),
        press: () => console.log("mousedown touchstart"),
        depress: () => console.log("mouseup touchend"),
      },
    };
  }

  attach() {
    let context = this;
    document.addEventListener(
      "keydown",
      (e) => {
        e.preventDefault();
        if (context.keyMap[e.key] && !e.repeat) context.keyMap[e.key].down();
      },
      false
    );
    document.addEventListener(
      "keyup",
      (e) => {
        e.preventDefault();
        if (context.keyMap[e.key] && !e.repeat) context.keyMap[e.key].up();
      },
      false
    );
    for (const [_, el] of Object.entries(this.clickMap)) {
      el.ref.addEventListener("mousedown", el.press);
      el.ref.addEventListener("touchstart", el.press);
      el.ref.addEventListener("mouseup", el.depress);
      el.ref.addEventListener("touchend", el.depress);
    }
  }
}

// Document Elements
var canvas = document.getElementById("board");
var CTX = canvas.getContext("2d");

// Game Objects
var inputs = new inputController();
var gameTimer = false; // Holds interval that runs game.
var opt; // Game props
var usr; // User props
var pc; // Player props

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
  CTX.clearRect(0, 0, canvas.width, canvas.height);
  canvas.style.border = "5px solid gray";
}

function setDefaults() {
  opt = {};
  usr = {};
  pc = {
    x: 0, // Player x coord
    y: 0, // Player y coord
    vx: 0, // Player x velocity in tiles per tick.
    vy: 0, // Player y velocity in tiles per tick.
  };
}

function startGame() {
  // set default values for game objects and outputs
  setDefaults();
  // clear the canvas for drawing
  clearCanvas();
  // attach controls
  inputs.bind();
  inputs.attach();
  // Set drawstyle
  axoProjMat.setProjection("Isometric");
  // Set game timer.
  gameTimer = setInterval(gameLoop, 1000 / 60);
}

function pauseGame() {
  // TODO
}

function continueGame() {
  // TODO
}

function endGame() {
  // TODO
}

function gameLoop() {
  var x, y, z;
  for (z = 0; z < 4; z++) {
    const hz = z / 2;
    for (y = hz; y < 4 - hz; y++) {
      for (x = hz; x < 4 - hz; x++) {
        // move the box
        const translated = vertices.map((vert) => {
          return P3(vert.x + x * boxSize, vert.y + y * boxSize, vert.z + z * boxSize);
        });

        // create a new array of 2D projected verts
        const projVerts = translated.map((vert) => axoProjMat.project(vert));
        // and render
        polygons.forEach((poly) => {
          CTX.fillStyle = poly.colour;
          CTX.strokeStyle = poly.colour;
          CTX.lineWidth = 1;
          CTX.beginPath();
          poly.indexes.forEach((index) => CTX.lineTo(projVerts[index].x, projVerts[index].y));
          CTX.stroke();
          CTX.fill();
        });
      }
    }
  }
}
