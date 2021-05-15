import { Resolution } from "../../modules/display.js";
import { KeyboardController } from "../../modules/inputs.js";
import { GameState, GameEngine } from "../../modules/state.js";

// create Application instance
(function (Application) {
  /**
   * create new pixi application to run game
   */
  var pixiApp = new PIXI.Application({
    antialias: false,
    backgroundColor: 0xf0ffff,
    resolution: window.devicePixelRatio || 1,
    autoDensity: true,
  });

  /**
   * create app container reference and screen handler methods
   */
  var appContainer = {
    $container: $("#appContainer"), // container element
    screen: {
      _elem: pixiApp.renderer.screen, // screen element
      ar: $("#ar-sel").val(), // aspect ratio, choices are {16:9, 3:2, 4:3}
      get w() {
        return this._elem.width; // screen width
      },
      get h() {
        return this._elem.height; // screen width
      },
      get tw() {
        return this._elem.width / Resolution[this.ar].widths.slice(-1)[0]; // tile width
      },
      get th() {
        return this._elem.height / Resolution[this.ar].heights.slice(-1)[0]; // tile height
      },
      resize: function (isFullscreen = false) {
        const targetWidth = isFullscreen ? window.innerWidth : this.$container.width();
        const r = Resolution.getNearest(this.screen.ar, targetWidth, window.innerHeight);
        pixiApp.renderer.resize(r.width, r.height); // resize renderer
        $("#res").html(`${r.width} x ${r.height}`); // update debug output
        if (Application.state == "running") setScene(); // re-draw scene
      },
    },
  };

  /**
   * create entities map
   */
  var entities = {
    pc: {
      /** PIXI class instance members */
      _sprite: new PIXI.Sprite(), // PIXI.Sprite instance
      _debug: new PIXI.Text("unknown", { fontSize: 12 }), // PIXI.Text instance
      /** State */
      get direction() {
        if (this.vx < 0 && this.vy < 0) this.direction = "up-left";
        if (this.vx == 0 && this.vy < 0) this.direction = "up";
        if (this.vx > 0 && this.vy < 0) this.direction = "up-right";
        if (this.vx > 0 && this.vy == 0) this.direction = "right";
        if (this.vx > 0 && this.vy > 0) this.direction = "down-right";
        if (this.vx == 0 && this.vy > 0) this.direction = "down";
        if (this.vx < 0 && this.vy > 0) this.direction = "down-left";
        if (this.vx < 0 && this.vy == 0) this.direction = "left";
      },
      get visible() {
        return this._sprite.visible;
      },
      hide: function () {
        this._sprite.visible = false;
      },
      show: function () {
        this._sprite.visible = true;
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
        this._debug.text = `
          name: pc,
          x: ${this._sprite.x}, 
          y: ${this._sprite.y}, 
          facing: ${this.direction}, 
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
      },
    },
    bg: {
      _container: new PIXI.Container(),
      _sprite: new PIXI.Sprite(),
    },
  };

  // create new keyboard controller
  var kbc = new KeyboardController();
  /** Up */
  kbc.eventCodeMap.KeyW.down = () => pc.setVel(pc.vx, -1);
  kbc.eventCodeMap.ArrowUp.down = () => pc.setVel(pc.vx, -1);
  kbc.eventCodeMap.KeyW.up = () => pc.setVel(pc.vx, 0);
  kbc.eventCodeMap.ArrowUp.up = () => pc.setVel(pc.vx, 0);
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
  /** Right */
  kbc.eventCodeMap.KeyD.down = () => pc.setVel(1, pc.vy);
  kbc.eventCodeMap.ArrowRight.down = () => pc.setVel(1, pc.vy);
  kbc.eventCodeMap.KeyD.up = () => pc.setVel(0, pc.vy);
  kbc.eventCodeMap.ArrowRight.up = () => pc.setVel(0, pc.vy);

  /** PRIVATE METHODS */

  /**
   * Callback for PIXI Loader load() method. Sets the scene with the loaded assets.
   * @param {*} loader The loader instance.
   * @param {*} resources The resources texture map.
   */
  function loadComplete(loader, resources) {
    // for (const [name, _] of Object.entries(resources)) {
    //   assetsMap.textures[name] = resources[name].texture; // save texture
    // }
    let sheet = resources["images/spritesheet.json"].spritesheet;
    appContainer.screen.resize(); // resize pixi app screen
    appContainer.$container.empty().append(pixiApp.view); // add pixi app to the DOM
    Application.startGame(); // start the game!
  }

  function setStage() {
    /** BACKGROUND */
    bg._sprite = new PIXI.TilingSprite(assetsMap.textures["grass"]); // load bg sprite
    bg._sprite.rotation = Math.PI / 4; // rotate background sprite
    bg._container.addChild(bg._sprite); // add tiling sprite to container
    bg._container.scale.y = Math.atan(Math.sin(30 * (Math.PI / 180))); // 0.463647609001 => 2:1 pixel ratio => dimetric
    pixiApp.stage.addChild(bg._container); // add container to stage
    /** PC */
    pc._sprite = new PIXI.Sprite(assetsMap.textures["man"]); // load pc sprite
    pc._sprite.anchor.set(0.5, 1); // in center-bottom of body
    pixiApp.stage.addChild(pc._sprite); // add pc to the stage
    pixiApp.stage.addChild(pc._debug); // add position text to the stage
  }

  function setScene() {
    /** BACKGROUND */
    bg._container.position.set(appContainer.screen.w / 3, 0);
    bg._sprite.width = appContainer.screen.w;
    bg._sprite.height = appContainer.screen.h;
    bg._sprite.tileScale.set(appContainer.screen.tw, appContainer.screen.th); // scale bg sprites to tile width/height
    /** PC */
    pc._sprite.scale.set(appContainer.screen.tw, appContainer.screen.th); // scale pc to tile width/height
    pc.setPos(appContainer.screen.w / 2, appContainer.screen.h / 2); // put pc in the center of the screen
    pc.setVel(0, 0); // start pc not moving
  }

  function drawScene(delta) {
    pc.setPos(pc.x + pc.vx, pc.y + pc.vy); // update pc position using velocity
  }

  /** PUBLIC MEMBERS AND METHODS */

  Application.state = "unloaded";

  Application.init = function () {
    /** FLAGS */
    Application.state = "initializing"; // set app state flag

    /** LISTENERS & HANDLERS */
    $(window).on("resize", () => {
      // call screen.resize if app not fullscreen
      !document.fullscreenElement ? appContainer.screen.resize() : {};
    });
    $("#fs-btn").on("click", () => {
      // toggle fullscreen mode for renderer view element
      !document.fullscreenElement ? pixiApp.renderer.view.requestFullscreen() : document.exitFullscreen();
    });
    $("#db-btn").on("click", () => {
      // toggle visibility of debug text
      pc._debug.visible = !pc._debug.visible;
    });
    $("#ar-sel").on("change", function () {
      const ar = this.value; // get selected aspect ratio
      appContainer.screen.ar = ar; // set screen aspect ratio
      appContainer.screen.resize(); // resize the screen
    });
    pixiApp.renderer.view.onfullscreenchange = (event) => {
      // call screen.resize when renderer view element changes state
      appContainer.screen.resize(document.fullscreenElement === event.target);
    };
    kbc.attachListenersAndHandlers(); // attach keyboard controller listeners and handlers

    /** METHODS */
    // PIXI.Loader.shared.add(assetsMap.resources); // use resource map to specify sprites to load
    PIXI.Loader.shared.add("assets/spritesheet.json"); // load spritesheet
    PIXI.Loader.shared.load(loadComplete); // load sprites, calling loadComplete() once finished
  };

  Application.startGame = function () {
    setStage(); // create and add sprites to the stage
    setScene(); // position loaded sprites on the stage
    Application.state = "running";
    pixiApp.ticker.add((delta) => drawScene(delta)); // start the scene ticker
  };

  Application.stopGame = function () {
    Application.state = "stopped";
    pixiApp.ticker.stop(); // stop the scene ticker
  };
})((window.Application = window.Application || {}));

// initialize Application
window.Application.init();
