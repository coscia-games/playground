import { InputController } from "../../modules/inputController.js";

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

// create assets reference map
var assetsMap = {
  resources: [{ name: "man", url: "assets/man.png" }],
  sprites: {},
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
      if (isFullscreen) {
        pixiApp.renderer.resize(window.innerWidth, window.innerHeight); // use entire window
      } else {
        // get nearest resolution to app container's width
        const resolution = resolutionMap.getNearest(this.width);
        pixiApp.renderer.resize(resolution.width, resolution.height);
        $("#res").html(`${resolution.width} x ${resolution.height}`);
      }
    },
  };

  // create player character object to track state
  var pc = {
    /** Hidden PIXI Members */
    _sprite: new PIXI.Sprite(), // PIXI.Sprite
    _postext: new PIXI.Text(), // PIXI.Text
    addToStage: function () {
      pixiApp.stage.addChild(pc._sprite); // add pc to the stage
      pixiApp.stage.addChild(pc._postext); // add position text to the stage
    },
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
      this._postext.text = `x: ${this._sprite.x}, y: ${this._sprite.y}, facing: ${this.direction}`;
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

  // create new input controller
  var gamepad = new InputController();

  /** PRIVATE METHODS */

  function setMoves() {
    /** Up */
    gamepad.eventCodeMap.KeyW.down = () => pc.setVel(pc.vx, -1);
    gamepad.eventCodeMap.ArrowUp.down = () => pc.setVel(pc.vx, -1);
    gamepad.eventCodeMap.KeyW.up = () => pc.setVel(pc.vx, 0);
    gamepad.eventCodeMap.ArrowUp.up = () => pc.setVel(pc.vx, 0);
    /** Right */
    gamepad.eventCodeMap.KeyD.down = () => pc.setVel(1, pc.vy);
    gamepad.eventCodeMap.ArrowRight.down = () => pc.setVel(1, pc.vy);
    gamepad.eventCodeMap.KeyD.up = () => pc.setVel(0, pc.vy);
    gamepad.eventCodeMap.ArrowRight.up = () => pc.setVel(0, pc.vy);
    /** Down */
    gamepad.eventCodeMap.KeyS.down = () => pc.setVel(pc.vx, 1);
    gamepad.eventCodeMap.ArrowDown.down = () => pc.setVel(pc.vx, 1);
    gamepad.eventCodeMap.KeyS.up = () => pc.setVel(pc.vx, 0);
    gamepad.eventCodeMap.ArrowDown.up = () => pc.setVel(pc.vx, 0);
    /** Left */
    gamepad.eventCodeMap.KeyA.down = () => pc.setVel(-1, pc.vy);
    gamepad.eventCodeMap.ArrowLeft.down = () => pc.setVel(-1, pc.vy);
    gamepad.eventCodeMap.KeyA.up = () => pc.setVel(0, pc.vy);
    gamepad.eventCodeMap.ArrowLeft.up = () => pc.setVel(0, pc.vy);
  }

  function setScene() {
    pc._sprite = assetsMap.sprites["man"]; // set pc sprite to man
    pc._sprite.anchor.set(0.5, 1); // in center-bottom of body
    pc.setPos(pixiApp.renderer.view.width / 2, pixiApp.renderer.view.height / 2); // put pc in the center of the screen
    pc.setVel(0, 0); // start pc not moving
    pc.addToStage(); // add pc to the stage
  }

  function drawScene(delta) {
    pc.setPos(pc.x + pc.vx, pc.y + pc.vy); // update pc position using velocity
  }

  /** PUBLIC MEMBERS AND METHODS */

  Application.init = function () {
    // attach fullscreen event listeners and handlers
    pixiApp.renderer.view.onfullscreenchange = (event) => {
      appContainer.onResize(document.fullscreenElement === event.target);
    };
    $("#fs-btn").on("click", () => {
      !document.fullscreenElement ? pixiApp.renderer.view.requestFullscreen() : document.exitFullscreen();
    });
    $(window).on("resize", () => {
      !document.fullscreenElement ? appContainer.onResize() : {};
    });

    // set gamepad controls
    setMoves();
    gamepad.attachKeyboardListenersAndHandlers();
    gamepad.attachKeyboardListenersAndHandlers();

    // load resources
    const pixiLoader = PIXI.Loader.shared;
    pixiLoader.add(assetsMap.resources);
    pixiLoader.load((loader, resources) => {
      for (const [name, _] of Object.entries(resources)) {
        // load sprites from resource list
        assetsMap.sprites[name] = new PIXI.Sprite(resources[name].texture);
      }
      setScene(); // use loaded sprites to set the stage
      appContainer.onResize(); // call onResize to resize pixi app
      appContainer.$elem.empty().append(pixiApp.view); // add pixi app to the DOM
      Application.startGame(); // start the game!
    });
  };

  Application.startGame = function () {
    pixiApp.ticker.add((delta) => drawScene(delta)); // start the ticker
  };

  Application.stopGame = function () {
    pixiApp.ticket.stop(); // stop the ticker
  };
})((window.Application = window.Application || {}));

// initialize Application
window.Application.init();
