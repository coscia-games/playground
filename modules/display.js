/**
 * Map of common resolutions.
 */
export const Resolution = {
  "16:9": {
    widths: [3840, 2560, 1920, 1600, 1280, 1024, 854, 640, 512, 426, 384, 256],
    heights: [2160, 1440, 1080, 900, 720, 576, 480, 360, 288, 240, 216, 144],
  },
  "3:2": {
    widths: [3240, 2160, 1920, 1440, 1152, 960, 720, 480, 360, 240],
    heights: [2160, 1440, 1280, 960, 768, 640, 480, 320, 240, 160],
  },
  "4:3": {
    widths: [2880, 1920, 1440, 1280, 1024, 800, 640, 512, 400, 320, 256],
    heights: [2160, 1440, 1080, 960, 768, 600, 480, 384, 300, 240, 192],
  },
  /**
   * Gets closest width and height for requested aspect ratio to the target
   * width, rounded down.
   * @param {String} ar Aspect Ratio => {16:9, 4:3, 3:2}
   * @param {Number} tw Target Width, usually the size of the app container
   * @param {Number} th Target Height, usually the innerHeight of the window
   * @returns [width, height] in px
   */
  getNearest: function (ar, tw, th) {
    const w = this[ar].widths;
    const h = this[ar].heights;
    for (var i = 0; i < w.length; i++) {
      if (w[i] < tw && h[i] < th) return { width: w[i], height: h[i] };
    }
  },
};
