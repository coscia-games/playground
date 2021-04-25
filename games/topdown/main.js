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
    transparent: false, // default: false
    resolution: 1, // default: 1
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
    // app.renderer.autoResize = true;
    appContainer.onResize();
    // Add the canvas that Pixi automatically created for you to the HTML document
    appContainer.$elem.append(app.view);
    // attach event listeners and handlers to fullscreen button
    app.renderer.view.onfullscreenchange = (event) =>
      appContainer.onResize(document.fullscreenElement === event.target);
    $("#fs-btn").on("click", () =>
      !document.fullscreenElement ? app.renderer.view.requestFullscreen() : document.exitFullscreen()
    );
    // resize app on window resize
    $(window).on("resize", () => (!document.fullscreenElement ? appContainer.onResize() : {}));
  };
})((window.Application = window.Application || {}));

// Call init
window.Application.init();
