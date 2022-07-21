import { Resolution } from "../modules/display.js";
import { KeyboardController } from "../modules/inputs.js";
import { GameState, GameEngine } from "../modules/state.js";

PIXI.settings.ROUND_PIXELS = true; // stop pixel interpolation

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
      resize: function (isFullscreen = false) {
        const targetWidth = isFullscreen ? window.innerWidth : appContainer.$container.width();
        const r = Resolution.getNearest(this.ar, targetWidth, window.innerHeight);
        pixiApp.renderer.resize(r.width, r.height); // resize renderer
        $("#res").html(`${r.width} x ${r.height}`); // update debug output
        if (Application.state == "running") setScene(); // re-draw scene
      },
    },
  };

  /**
   * create assets map
   */
  var assets = {
    scaleFactor: Math.atan(Math.sin(30 * (Math.PI / 180))), // 0.463647609001 => 2:1 pixel ratio => dimetric
    sheet: {},
  };

  /**
   * create entities map
   */
  var entities = {
    container: new PIXI.Container(),
    background: {
      /** PIXI class instance members */
      _tilemap: new PIXI.TilingSprite(),
      get w() {
        return this._tilemap.width;
      },
      get h() {
        return this._tilemap.height;
      },
      get tw() {
        return appContainer.screen._elem.width / Resolution[appContainer.screen.ar].widths.slice(-1)[0]; // tile width
      },
      get th() {
        return appContainer.screen._elem.height / Resolution[appContainer.screen.ar].heights.slice(-1)[0]; // tile height
      },
      setPos: function (x, y) {
        this._tilemap.position.set(x, y);
      },
    },
    player: {
      /** PIXI class instance members */
      _sprite: new PIXI.Sprite(), // PIXI.Sprite instance
      _debug: new PIXI.Text("unknown", { fontSize: 12 }), // PIXI.Text instance
      /** State */
      get direction() {
        if (this.vx < 0 && this.vy < 0) return "up-left";
        if (this.vx == 0 && this.vy < 0) return "up";
        if (this.vx > 0 && this.vy < 0) return "up-right";
        if (this.vx > 0 && this.vy == 0) return "right";
        if (this.vx > 0 && this.vy > 0) return "down-right";
        if (this.vx == 0 && this.vy > 0) return "down";
        if (this.vx < 0 && this.vy > 0) return "down-left";
        if (this.vx < 0 && this.vy == 0) return "left";
        return "up"; // default direction
      },
      get visible() {
        return this._sprite.visible;
      },
      set visible(flag) {
        this._sprite.visible = flag;
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
  };

  // create new keyboard controller
  var kbc = new KeyboardController();

  /** PRIVATE METHODS */

  /**
   * Callback for PIXI Loader load() method. Sets the scene with the loaded assets.
   * @param {*} loader The loader instance.
   * @param {*} resources The resources texture map.
   */
  function loadComplete(loader, resources) {
    assets.sheet = resources["assets/spritesheet.json"].spritesheet;
    appContainer.screen.resize(); // resize pixi app screen
    appContainer.$container.empty().append(pixiApp.view); // add pixi app to the DOM
    Application.startGame(); // start the game!
  }

  /**
   * Create sprites and add them to the stage.
   */
  function setStage() {
    let bg = entities.background; // alias
    let pc = entities.player; // alias

    entities.container.scale.y = assets.scaleFactor; // apply scale factor to container holding entities

    bg._tilemap = new PIXI.TilingSprite(assets.sheet.textures["grass.png"]); // load background sprite into tilemap
    bg._tilemap.width = appContainer.screen.w; // set tilemap width
    bg._tilemap.height = appContainer.screen.h; // set tilemap height
    bg._tilemap.tileScale.set(bg.tw, bg.th); // scale sprites to tile width/height
    bg._tilemap.rotation = Math.PI / 4; // rotate tilemap 90 degrees

    pc._sprite = new PIXI.Sprite(assets.sheet.textures["man.png"]); // load pc sprite
    pc._sprite.anchor.set(0.5, 1); // in center-bottom of body
    pc._sprite.scale.set(bg.tw, bg.th); // scale pc to tile width/height

    /** Add to the stage */
    bg._tilemap.addChild(pc._sprite); // add pc to background tilemap
    entities.container.addChild(bg._tilemap); // add tilemap to entities container
    pixiApp.stage.addChild(entities.container); // add container to stage
    pixiApp.stage.addChild(pc._debug); // add position text to the stage
  }

  /**
   * Position sprites and set state.
   */
  function setScene() {
    let pc = entities.player; // alias
    let bg = entities.background; // alias
    bg.setPos(appContainer.screen.w / 2, appContainer.screen.h / 2); // put bg in the center of the screen
    pc.setPos(bg.w / 2, bg.h / 2); // put pc in the center of the tilemap
    pc.setVel(0, 0); // start pc not moving
  }

  /**
   * Update scene every tick.
   * @param {*} delta
   */
  function startShow(delta) {
    let pc = entities.player; // alias
    pc.setPos(pc.x + pc.vx, pc.y + pc.vy); // update pc position using velocity
  }

  /** PUBLIC MEMBERS AND METHODS */

  Application.state = "unloaded";

  Application.init = function () {
    /** FLAGS */
    Application.state = "initializing"; // set app state flag

    /** CONTROLS */
    let pc = entities.player; // alias
    kbc.eventCodeMap.KeyW.down = () => pc.setVel(pc.vx, -1);
    kbc.eventCodeMap.KeyW.up = () => pc.setVel(pc.vx, 0);
    kbc.eventCodeMap.ArrowUp.down = () => pc.setVel(pc.vx, -1);
    kbc.eventCodeMap.ArrowUp.up = () => pc.setVel(pc.vx, 0);
    kbc.eventCodeMap.KeyS.down = () => pc.setVel(pc.vx, 1);
    kbc.eventCodeMap.KeyS.up = () => pc.setVel(pc.vx, 0);
    kbc.eventCodeMap.ArrowDown.down = () => pc.setVel(pc.vx, 1);
    kbc.eventCodeMap.ArrowDown.up = () => pc.setVel(pc.vx, 0);
    kbc.eventCodeMap.KeyA.down = () => pc.setVel(-1, pc.vy);
    kbc.eventCodeMap.KeyA.up = () => pc.setVel(0, pc.vy);
    kbc.eventCodeMap.ArrowLeft.down = () => pc.setVel(-1, pc.vy);
    kbc.eventCodeMap.ArrowLeft.up = () => pc.setVel(0, pc.vy);
    kbc.eventCodeMap.KeyD.down = () => pc.setVel(1, pc.vy);
    kbc.eventCodeMap.KeyD.up = () => pc.setVel(0, pc.vy);
    kbc.eventCodeMap.ArrowRight.down = () => pc.setVel(1, pc.vy);
    kbc.eventCodeMap.ArrowRight.up = () => pc.setVel(0, pc.vy);

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
      entities.player._debug.visible = !entities.player._debug.visible;
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
    PIXI.Loader.shared.add("assets/spritesheet.json"); // load spritesheet
    PIXI.Loader.shared.load(loadComplete); // load sprites, calling loadComplete() once finished
  };

  Application.startGame = function () {
    setStage(); // create and add sprites to the stage
    setScene(); // position loaded sprites on the stage
    Application.state = "running";
    pixiApp.ticker.add((delta) => startShow(delta)); // start the scene ticker
  };

  Application.stopGame = function () {
    Application.state = "stopped";
    pixiApp.ticker.stop(); // stop the scene ticker
  };
})((window.Application = window.Application || {}));

// initialize Application
window.Application.init();
