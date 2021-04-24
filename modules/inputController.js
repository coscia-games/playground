export class InputController {
  eventKeyMap;
  eventCodeMap;
  clickMap;

  constructor() {
    let context = this;

    /**
     * Initialize event key map. Keys are dependent on the localization, so
     * the key should represent the same character being pressed on the
     * keyboard, even if the locations of the keys aren't the same.
     */
    this.eventKeyMap = {
      w: {},
      a: {},
      s: {},
      d: {},
      p: {},
      " ": {},
      ArrowLeft: {},
      ArrowUp: {},
      ArrowRight: {},
      ArrowDown: {},
    };
    Object.getOwnPropertyNames(this.eventKeyMap).forEach((key) => {
      let value = context.eventKeyMap[key];
      value.key = key; // set reference to key name
    });

    /**
     * Initialize event code map. Codes are not dependent on the localization,
     * so the code should be in the same location on the keyboard even if the
     * key binding itself is not the same.
     */
    this.eventCodeMap = {
      KeyW: {},
      KeyA: {},
      KeyS: {},
      KeyD: {},
      KeyP: {},
      Space: {},
      ArrowLeft: {},
      ArrowUp: {},
      ArrowRight: {},
      ArrowDown: {},
    };
    Object.getOwnPropertyNames(this.eventCodeMap).forEach((key) => {
      let value = context.eventCodeMap[key];
      value.code = key; // set reference to key name
    });

    /**
     * Initialize on-screen click inputs map. These names are ids for elements
     * in the HTML that should recieve event listeners.
     */
    this.clickMap = {
      leftarrow: {},
      uparrow: {},
      rightarrow: {},
      downarrow: {},
    };
    Object.getOwnPropertyNames(this.clickMap).forEach((key) => {
      let value = context.clickMap[key];
      value.id = key; // set reference to key name
      value.ref = document.getElementById(key);
    });
  }

  attachListeners() {
    let context = this;
    document.addEventListener(
      "keydown",
      (e) => {
        e.preventDefault();
        if (!e.repeat) {
          if (context.eventKeyMap[e.key] && context.eventKeyMap[e.key].hasOwnProperty("down")) {
            context.eventKeyMap[e.key].down();
          }
          if (context.eventCodeMap[e.code] && context.eventCodeMap[e.code].hasOwnProperty("down")) {
            context.eventCodeMap[e.code].down();
          }
        }
      },
      false
    );
    document.addEventListener(
      "keyup",
      (e) => {
        e.preventDefault();
        if (!e.repeat) {
          if (context.eventKeyMap[e.key] && context.eventKeyMap[e.key].hasOwnProperty("up")) {
            context.eventKeyMap[e.key].up();
          }
          if (context.eventCodeMap[e.code] && context.eventCodeMap[e.code].hasOwnProperty("up")) {
            context.eventCodeMap[e.code].up();
          }
        }
      },
      false
    );
    for (const [_, el] of Object.entries(this.clickMap)) {
      el.ref.addEventListener("mousedown", el.press, {
        passive: false,
      });
      el.ref.addEventListener("touchstart", el.press, {
        passive: false,
      });
      el.ref.addEventListener("mouseup", el.depress, {
        passive: false,
      });
      el.ref.addEventListener("touchend", el.depress, {
        passive: false,
      });
    }
  }
}
