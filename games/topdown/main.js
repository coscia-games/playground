import { InputController } from "../../modules/inputController.js";

// physics engine
var Engine = Matter.Engine,
  Render = Matter.Render,
  Runner = Matter.Runner,
  Bodies = Matter.Bodies,
  Composite = Matter.Composite;

// input controller
var inputController = new InputController();

// Document Elements
var appContainer = $("#appContainer");

// Window events
window.onload = function () {
  load(); // load the app
};
window.onresize = function () {
  location.reload(); // refresh the entire page
};

function load() {
  // check if running WebGL or canvas
  let type = "WebGL";
  if (!PIXI.utils.isWebGLSupported()) type = "canvas";
  PIXI.utils.sayHello(type);
  // Set options
  let opts = {
    width: 0.8 * appContainer.width(), // default: 800
    height: 0.8 * appContainer.width() * (3 / 4), // default: 600
    antialias: true, // default: false
    transparent: false, // default: false
    resolution: 1, // default: 1
  };
  // Create a Pixi Application
  let app = new PIXI.Application(opts);
  // Add the canvas that Pixi automatically created for you to the HTML document
  appContainer.append(app.view);
}
