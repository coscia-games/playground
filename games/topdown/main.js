import { Resolution } from "../../modules/display.js";
import { KeyboardController } from "../../modules/inputs.js";
import { GameState, GameEngine } from "../../modules/state.js";

PIXI.settings.ROUND_PIXELS = true; // stop pixel interpolation
PIXI.utils.skipHello(); // stop logging version info to console

// create Application instance
(function (Application) {
  /**
   * PIXI application that runs rendering calculations for us really fast
   */
  var pixiApp = new PIXI.Application({
    antialias: false,
    backgroundColor: 0xf0ffff,
    resolution: window.devicePixelRatio || 1,
    autoDensity: true,
  });

  /**
   * stores all raw data for sprites, level data, etc.
   */
  var assets = {
    sheet: {}, // map of sheet textures for creating sprites
  };

  /**
   * handles display attributes and controller I/O functions
   */
  var console = {
    display: {
      $container: $("#app"), // container as a Jquery element
      screen: {
        _elem: pixiApp.renderer.screen, // screen element from the Pixi app
        ar: $("#ar-sel").val(), // aspect ratio, choices are {16:9, 3:2, 4:3}
        get w() {
          return this._elem.width; // screen width
        },
        get h() {
          return this._elem.height; // screen width
        },
        resize: function (isFullscreen = false) {
          const targetWidth = isFullscreen ? window.innerWidth : console.display.$container.width();
          const r = Resolution.getNearest(this.ar, targetWidth, window.innerHeight);
          pixiApp.renderer.resize(r.width, r.height); // resize renderer
          $("#res").html(`${r.width} x ${r.height}`); // update debug output
          if (Application.state == "running") setScene(); // re-draw scene
        },
      },
    },
    io: {
      keyboardController: new KeyboardController(), // create new keyboard controller
    },
  };

  /**
   * holds graphics data for rendering images to the screen
   */
  var graphics = {
    settings: {
      scaleFactor: Math.atan(Math.sin(30 * (Math.PI / 180))), // 0.463647609001 => 2:1 pixel ratio => dimetric perspective
    },
    layers: {
      background: {
        _container: new PIXI.Container(), // holds any sprites drawn to the background layer
        tilemap: {
          _sprite: new PIXI.TilingSprite(), // tiling Sprite
          get w() {
            return this._sprite.width;
          },
          get h() {
            return this._sprite.height;
          },
          get tw() {
            return console.display.screen._elem.width / Resolution[console.display.screen.ar].widths.slice(-1)[0]; // tile width
          },
          get th() {
            return console.display.screen._elem.height / Resolution[console.display.screen.ar].heights.slice(-1)[0]; // tile height
          },
          setPos: function (x, y) {
            this._sprite.position.set(x, y);
          },
        },
      },
      object: {
        _container: new PIXI.Container(), // holds any sprites drawn to the object layer
        player: {
          _sprite: new PIXI.Sprite(), // PIXI.Sprite instance
          _debug: new PIXI.Text("unknown", { fontSize: 12 }), // PIXI.Text instance
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
          get x() {
            return this._sprite.x;
          },
          get y() {
            return this._sprite.y;
          },
          setPos: function (x, y) {
            this._sprite.position.set(x, y); // update sprite position
            // update debug text
            let kbc = console.io.keyboardController; // alias
            this._debug.text = `
              name: pc,
              x: ${this._sprite.x}, 
              y: ${this._sprite.y}, 
              facing: ${this.direction}, 
              eventStack: [${kbc.eventCodeStack.map((x) => x.code).join(", ")}]
            `;
          },
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
      },
    },
  };

  /** PRIVATE METHODS */

  /**
   * Create sprites and add them to the stage.
   */
  function setStage() {
    const BGL = graphics.layers.background; // background graphics layer (BGL)
    const OGL = graphics.layers.object; // object graphics layer (OGL)

    // create Pixi Sprites from assets data
    BGL.tilemap._sprite = new PIXI.TilingSprite(assets.sheet.textures["grass.png"]);
    OGL.player._sprite = new PIXI.Sprite(assets.sheet.textures["man.png"]);

    // background layer sprites
    BGL.tilemap._sprite.width = console.display.screen.w; // set tilemap width
    BGL.tilemap._sprite.height = console.display.screen.h; // set tilemap height

    // object layer sprites
    OGL.player._sprite.anchor.set(0.5, 1); // in center-bottom of body

    // scale sprites
    BGL.tilemap._sprite.tileScale.set(BGL.tilemap.tw, BGL.tilemap.th); // scale sprite to tile width and height
    OGL.player._sprite.scale.set(BGL.tilemap.tw, BGL.tilemap.th); // scale pc sprite to background tile width and height

    // scale each layer container to achieve 2:1 dimetric perspective
    BGL._container.scale.y = graphics.settings.scaleFactor;
    OGL._container.scale.y = graphics.settings.scaleFactor;

    // rotate sprites 90 degrees to get angled 3D projection perspective
    BGL.tilemap._sprite.rotation = Math.PI / 4;
    OGL.player._sprite.rotation = Math.PI / 4;

    // add sprites to background layer
    BGL._container.addChild(BGL.tilemap._sprite);

    // add sprites to object layer
    OGL._container.addChild(OGL.player._sprite);

    // add containers to pixiApp stage
    pixiApp.stage.addChild(BGL._container);
    pixiApp.stage.addChild(OGL._container);
    pixiApp.stage.addChild(OGL.player._debug); // add debug directly to the screen
  }

  /**
   * Position sprites and set state.
   */
  function setScene() {
    let pc = graphics.layers.object.player; // alias
    let tm = graphics.layers.background.tilemap; // alias
    tm.setPos(console.display.screen.w / 2, console.display.screen.h / 2); // put tm in the center of the screen
    pc.setPos(tm.w / 2, tm.h / 2); // put pc in the center of the tilemap
    pc.setVel(0, 0); // start pc not moving
  }

  /**
   * Update scene every tick.
   * @param {*} delta
   */
  function startShow(delta) {
    let pc = graphics.layers.object.player; // alias
    pc.setPos(pc.x + pc.vx, pc.y + pc.vy); // update pc position using velocity
  }

  /** PUBLIC MEMBERS AND METHODS */

  Application.state = "unloaded";

  Application.init = function () {
    let pc = graphics.layers.object.player;
    let kbc = console.io.keyboardController;
    let scrn = console.display.screen;

    /** FLAGS */
    Application.state = "initializing"; // set app state flag

    /** CONTROLS */
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
    kbc.attachListenersAndHandlers();

    /** LISTENERS & HANDLERS */
    $(window).on("resize", () => {
      // call screen.resize if app not fullscreen
      !document.fullscreenElement ? scrn.resize() : {};
    });
    $("#fs-btn").on("click", () => {
      // toggle fullscreen mode for renderer view element
      !document.fullscreenElement ? pixiApp.renderer.view.requestFullscreen() : document.exitFullscreen();
    });
    $("#db-btn").on("click", () => {
      // toggle visibility of debug text
      graphics.layers.object.player._debug.visible = !graphics.layers.object.player._debug.visible;
    });
    $("#ar-sel").on("change", function () {
      scrn.ar = this.value; // set screen aspect ratio
      scrn.resize(); // resize the screen with new aspect ratio
    });
    pixiApp.renderer.view.onfullscreenchange = (event) => {
      // call screen.resize when renderer view element changes state
      scrn.resize(document.fullscreenElement === event.target);
    };

    /** METHODS */
    PIXI.Loader.shared.add("assets/spritesheet.json"); // load spritesheet
    PIXI.Loader.shared.load(function (loader, resources) {
      assets.sheet = resources["assets/spritesheet.json"].spritesheet;
      console.display.screen.resize(); // resize console screen after loading assets
      console.display.$container.empty().append(pixiApp.view); // add pixi app to the DOM
      Application.startGame(); // start the game!
    }); // load sprites
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
