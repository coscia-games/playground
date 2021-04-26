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
        // use entire window
        pixiApp.renderer.resize(window.innerWidth, window.innerHeight);
      } else {
        // get nearest resolution to app container's width
        const resolution = resolutionMap.getNearest(this.width);
        pixiApp.renderer.resize(resolution.width, resolution.height);
        $("#res").html(`${resolution.width} x ${resolution.height}`);
      }
    },
  };

  /** PRIVATE METHODS */

  function setScene() {
    // establish main character
    let manSprite = assetsMap.sprites["man"];
    manSprite.anchor.set(0.5, 1); // in center-bottom of body
    pixiApp.stage.addChild(manSprite);
  }

  function drawScene(delta) {
    let manSprite = assetsMap.sprites["man"];
    manSprite.position.set(pixiApp.screen.width / 2, pixiApp.screen.height / 2);
  }

  /** PUBLIC MEMBERS AND METHODS */

  Application.init = function () {
    // attach fullscreen event listeners and handlers
    pixiApp.renderer.view.onfullscreenchange = (event) =>
      appContainer.onResize(document.fullscreenElement === event.target);
    $("#fs-btn").on("click", () =>
      !document.fullscreenElement ? pixiApp.renderer.view.requestFullscreen() : document.exitFullscreen()
    );
    $(window).on("resize", () => (!document.fullscreenElement ? appContainer.onResize() : {}));

    // load resources
    const pixiLoader = PIXI.Loader.shared;
    pixiLoader.add(assetsMap.resources);
    pixiLoader.load((loader, resources) => {
      for (const [name, _] of Object.entries(resources)) {
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
