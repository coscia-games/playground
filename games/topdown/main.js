import { InputController } from "../../modules/inputController.js";

(function (Application) {
  // common 4:3 resolutions
  var resMap = {
    widths: [1440, 1280, 1024, 960, 800, 640, 512, 400, 320, 256],
    heights: [1080, 960, 768, 720, 600, 480, 384, 300, 240, 192],
  };

  // create new input controller
  var inputController = new InputController();

  // create new pixi app
  var app = new PIXI.Application({
    antialias: true, // default: false
    backgroundColor: 0x1099bb,
    resolution: window.devicePixelRatio || 1,
  });

  // create app container and methods
  var appContainer = {
    $elem: $("#appContainer"),
    onResize: function (isFullscreen = false) {
      if (isFullscreen) {
        app.renderer.resize(window.innerWidth, window.innerHeight);
      } else {
        // get nearest resolution
        let targetWidth = this.$elem.width();
        for (var i = 0; i < resMap.widths.length; i++) {
          if (resMap.widths[i] < targetWidth) {
            app.renderer.resize(resMap.widths[i], resMap.heights[i]);
            $("#res").html(`${resMap.widths[i]} x ${resMap.heights[i]}`);
            break;
          }
        }
      }
    },
  };

  Application.init = function () {
    // set app sizes and add
    appContainer.onResize();
    appContainer.$elem.append(app.view);

    // attach fullscreen event listeners and
    app.renderer.view.onfullscreenchange = (event) =>
      appContainer.onResize(document.fullscreenElement === event.target);
    $("#fs-btn").on("click", () =>
      !document.fullscreenElement ? app.renderer.view.requestFullscreen() : document.exitFullscreen()
    );
    $(window).on("resize", () => (!document.fullscreenElement ? appContainer.onResize() : {}));

    // load sprites to the stage
    const container = new PIXI.Container();

    app.stage.addChild(container);

    // Create a new texture
    const texture = PIXI.Texture.from("assets/man.png");

    // Create a 5x5 grid of bunnies
    for (let i = 0; i < 25; i++) {
      const man = new PIXI.Sprite(texture);
      man.anchor.set(0.5);
      man.x = (i % 5) * 40;
      man.y = Math.floor(i / 5) * 40;
      container.addChild(man);
    }

    // Move container to the center
    container.x = app.screen.width / 2;
    container.y = app.screen.height / 2;

    // Center man sprite in local container coordinates
    container.pivot.x = container.width / 2;
    container.pivot.y = container.height / 2;

    // Listen for animate update
    app.ticker.add((delta) => {
      container.rotation -= 0.01 * delta;
    });
  };
})((window.Application = window.Application || {}));

// Call init
window.Application.init();
