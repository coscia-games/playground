import { assetsMap } from "./assets/assets.map.js";
import { KeyboardController } from "../../modules/inputControllers.js";

// create common 4:3 resolutions map
var resolutionMap = {
  widths: [1440, 1280, 1024, 960, 800, 640, 512, 400, 320, 256],
  heights: [1080, 960, 768, 720, 600, 480, 384, 300, 240, 192],
  getNearest: function (targetWidth) {
    for (var i = 0; i < this.widths.length; i++) {
      if (this.widths[i] < targetWidth) return { width: this.widths[i], height: this.heights[i] };
    }
  },
};

// create Application instance
(function (Application) {
  /** PRIVATE MEMBERS */

  // create new pixi application
  var pixiApp = new PIXI.Application({
    antialias: true,
    backgroundColor: 0x1099bb,
    resolution: window.devicePixelRatio || 1,
    autoDensity: true,
  });

  // create pixiApp container reference and methods
  var appContainer = {
    $elem: $("#appContainer"),
    get width() {
      return this.$elem.width();
    },
    get height() {
      return this.$elem.height();
    },
    onResize: function (isFullscreen = false) {
      // get nearest resolution
      const targetWidth = isFullscreen ? window.innerWidth : this.width;
      const resolution = resolutionMap.getNearest(targetWidth);
      pixiApp.renderer.resize(resolution.width, resolution.height);
      $("#res").html(`${resolution.width} x ${resolution.height}`);
      if (Application.state == "running") setScene();
    },
  };

  // create player character object to track state
  var pc = {
    /** PIXI class instance members */
    _sprite: new PIXI.Sprite(), // PIXI.Sprite instance
    _postext: new PIXI.Text("unknown", { fontSize: 12 }), // PIXI.Text instance
    /** State */
    direction: "up",
    /** Visibility */
    hide: function () {
      this._sprite.visible = false;
    },
    show: function () {
      this._sprite.visible = true;
    },
    get visible() {
      return this._sprite.visible;
    },
    /** Position */
    get x() {
      return this._sprite.x;
    },
    get y() {
      return this._sprite.y;
    },
    setPos: function (x, y) {
      this._sprite.position.set(x, y);
      this._postext.text = `
        x: ${this._sprite.x}, y: ${this._sprite.y}, facing: ${this.direction}\n
        eventStack: [${kbc.eventCodeStack.map((x) => x.code).join(", ")}]
      `;
    },
    /** Velocity */
    get vx() {
      return this._sprite.vx;
    },
    get vy() {
      return this._sprite.vy;
    },
    setVel: function (vx, vy) {
      this._sprite.vx = vx;
      this._sprite.vy = vy;
      if (vx < 0 && vy < 0) this.direction = "up-left";
      if (vx == 0 && vy < 0) this.direction = "up";
      if (vx > 0 && vy < 0) this.direction = "up-right";
      if (vx > 0 && vy == 0) this.direction = "right";
      if (vx > 0 && vy > 0) this.direction = "down-right";
      if (vx == 0 && vy > 0) this.direction = "down";
      if (vx < 0 && vy > 0) this.direction = "down-left";
      if (vx < 0 && vy == 0) this.direction = "left";
    },
  };

  // create background object
  var bg = {
    _sprite: new PIXI.Sprite(),
  };

  // create new keyboard controller
  var kbc = new KeyboardController();
  /** Up */
  kbc.eventCodeMap.KeyW.down = () => pc.setVel(pc.vx, -1);
  kbc.eventCodeMap.ArrowUp.down = () => pc.setVel(pc.vx, -1);
  kbc.eventCodeMap.KeyW.up = () => pc.setVel(pc.vx, 0);
  kbc.eventCodeMap.ArrowUp.up = () => pc.setVel(pc.vx, 0);
  /** Right */
  kbc.eventCodeMap.KeyD.down = () => pc.setVel(1, pc.vy);
  kbc.eventCodeMap.ArrowRight.down = () => pc.setVel(1, pc.vy);
  kbc.eventCodeMap.KeyD.up = () => pc.setVel(0, pc.vy);
  kbc.eventCodeMap.ArrowRight.up = () => pc.setVel(0, pc.vy);
  /** Down */
  kbc.eventCodeMap.KeyS.down = () => pc.setVel(pc.vx, 1);
  kbc.eventCodeMap.ArrowDown.down = () => pc.setVel(pc.vx, 1);
  kbc.eventCodeMap.KeyS.up = () => pc.setVel(pc.vx, 0);
  kbc.eventCodeMap.ArrowDown.up = () => pc.setVel(pc.vx, 0);
  /** Left */
  kbc.eventCodeMap.KeyA.down = () => pc.setVel(-1, pc.vy);
  kbc.eventCodeMap.ArrowLeft.down = () => pc.setVel(-1, pc.vy);
  kbc.eventCodeMap.KeyA.up = () => pc.setVel(0, pc.vy);
  kbc.eventCodeMap.ArrowLeft.up = () => pc.setVel(0, pc.vy);

  /** PRIVATE METHODS */

  function Grid() {
    PIXI.Container.call(this);
    var grid = [];
    for (var j = 0; j < 15; j++) {
      grid[j] = [];
      for (var i = 0; i < 10; i++) {
        grid[j][i] = new PIXI.Graphics();
        grid[j][i].drawRect(0, 0, 16, 16);
        grid[j][i].position.x = 16 * i;
        grid[j][i].position.y = 16 * j;
        this.addChild(grid[j][i]);
      }
    }
    this.grid = grid;
  }
  Grid.prototype = Object.create(PIXI.Container.prototype);
  Grid.prototype.constructor = Grid;

  /**
   * Callback for PIXI Loader load() method. Sets the scene with the loaded assets.
   * @param {*} loader The loader instance.
   * @param {*} resources The resources texture map.
   */
  function loadComplete(loader, resources) {
    for (const [name, _] of Object.entries(resources)) {
      assetsMap.textures[name] = resources[name].texture; // save texture
    }
    appContainer.onResize(); // call onResize to resize pixi app
    appContainer.$elem.empty().append(pixiApp.view); // add pixi app to the DOM
    Application.startGame(); // start the game!
  }

  function setStage() {
    bg._sprite = new PIXI.TilingSprite(assetsMap.textures["grass"]); // load bg sprite
    pixiApp.stage.addChild(bg._sprite); // add background tile to stage
    pc._sprite = new PIXI.Sprite(assetsMap.textures["man"]); // load pc sprite
    pixiApp.stage.addChild(pc._sprite); // add pc to the stage
    pixiApp.stage.addChild(pc._postext); // add position text to the stage
  }

  function setScene() {
    const scw = pixiApp.renderer.screen.width; // screen width
    const sch = pixiApp.renderer.screen.height; // screen height
    /** Background */
    bg._sprite.width = scw;
    bg._sprite.height = sch;
    bg._sprite.tileScale.set(scw / 240, sch / 160);
    /** PC */
    pc._sprite.anchor.set(0.5, 1); // in center-bottom of body
    pc._sprite.scale.set(scw / 240, sch / 160);
    pc.setPos(scw / 2, sch / 2); // put pc in the center of the screen
    pc.setVel(0, 0); // start pc not moving
  }

  function drawScene(delta) {
    pc.setPos(pc.x + pc.vx, pc.y + pc.vy); // update pc position using velocity
  }

  /** PUBLIC MEMBERS AND METHODS */

  Application.state = "unloaded";

  Application.init = function () {
    Application.state = "initializing";
    // attach event listeners and handlers to document elements
    $(window).on("resize", () => {
      !document.fullscreenElement ? appContainer.onResize() : {};
    });
    $("#fs-btn").on("click", () => {
      !document.fullscreenElement ? pixiApp.renderer.view.requestFullscreen() : document.exitFullscreen();
    });
    $("#db-btn").on("click", () => {
      pc._postext.visible = !pc._postext.visible;
    });

    // set event listeners and handlers for application objects
    pixiApp.renderer.view.onfullscreenchange = (event) => {
      appContainer.onResize(document.fullscreenElement === event.target);
    };
    kbc.attachListenersAndHandlers();

    // load resources
    PIXI.Loader.shared.add(assetsMap.resources); // use resource map to specify sprites to load
    PIXI.Loader.shared.load(loadComplete); // load sprites, calling loadComplete() once finished
  };

  Application.startGame = function () {
    Application.state = "running";
    setStage(); // create and add sprites to the stage
    setScene(); // position loaded sprites on the stage
    pixiApp.ticker.add((delta) => drawScene(delta)); // start the scene ticker
  };

  Application.stopGame = function () {
    Application.state = "stopped";
    pixiApp.ticker.stop(); // stop the scene ticker
  };
})((window.Application = window.Application || {}));

// initialize Application
window.Application.init();
