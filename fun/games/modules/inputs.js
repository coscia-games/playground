/**
 * List of KeyboardEvent.code values. Codes are not dependent on the
 * localization, so the code should be in the same location on the keyboard
 * even if the key binding itself is not the same.
 */
const KeyboardEventCodes = [
  "KeyW",
  "KeyA",
  "KeyS",
  "KeyD",
  "KeyP",
  "Space",
  "Enter",
  "ArrowLeft",
  "ArrowUp",
  "ArrowRight",
  "ArrowDown",
];

/**
 * List of KeyboardEvent.key values. Keys are dependent on the localization,
 * so the key should represent the same character being pressed on the
 * keyboard, even if the locations of the keys aren't the same.
 */
const KeyboardEventKeys = ["w", "a", "s", "d", "p", " ", "Enter", "ArrowLeft", "ArrowUp", "ArrowRight", "ArrowDown"];

/**
 * List of clickable HTML Elements defined on the page. These names are ids
 * for elements in the HTML that should recieve event listeners.
 */
const ClickableElementIds = ["leftarrow", "uparrow", "rightarrow", "downarrow"];

/**
 * Controller class for keyboard inputs.
 */
export class KeyboardController {
  eventKeyMap;
  eventKeyStack;
  eventCodeMap;
  eventCodeStack;

  constructor() {
    /**
     * Initialize event key map.
     */
    this.eventKeyMap = Object.fromEntries(KeyboardEventKeys.map((x) => [x, { key: x, pressed: false }]));
    /**
     * Initialize event key stack. This will track the most recent event key
     * pressed to prevent overwriting prior key press events.
     */
    this.eventKeyStack = [];
    /**
     * Initialize event code map.
     */
    this.eventCodeMap = Object.fromEntries(KeyboardEventCodes.map((x) => [x, { code: x, pressed: false }]));
    /**
     * Initialize event code stack. This will track the most recent event code
     * pressed to prevent overwriting prior code press events.
     */
    this.eventCodeStack = [];
  }

  /**
   * Attaches keydown and keyup event handlers to keystroke event listeners.
   */
  attachListenersAndHandlers() {
    let context = this;
    document.addEventListener(
      "keydown",
      (e) => {
        e.preventDefault(); // prevent default behavior to avoid unexpected page updates
        if (!e.repeat) {
          const eventKeyObj = context.eventKeyMap[e.key];
          if (eventKeyObj && eventKeyObj.hasOwnProperty("down")) {
            eventKeyObj.down(); // call down() for eventKeyObj
            context.eventKeyStack.push(eventKeyObj); // add eventKeyObj to stack
          }
          const eventCodeObj = context.eventCodeMap[e.code];
          if (eventCodeObj && eventCodeObj.hasOwnProperty("down")) {
            eventCodeObj.down(); // call down() for eventCodeObj
            context.eventCodeStack.push(eventCodeObj); // add eventCodeObj to stack
          }
        }
      },
      false
    );
    document.addEventListener(
      "keyup",
      (e) => {
        e.preventDefault(); // prevent default behavior to avoid unexpected page updates
        if (!e.repeat) {
          const eventKeyObj = context.eventKeyMap[e.key];
          if (eventKeyObj && eventKeyObj.hasOwnProperty("up")) {
            // call up() for eventKeyObj
            eventKeyObj.up();
            // remove all eventKeyObj instances from the current stack
            context.eventKeyStack = context.eventKeyStack.filter((x) => x !== eventKeyObj);
            // call down in insertion order for each eventKeyObj left in the stack
            context.eventKeyStack.forEach((eventKeyObj) => eventKeyObj.down());
          }
          const eventCodeObj = context.eventCodeMap[e.code];
          if (eventCodeObj && eventCodeObj.hasOwnProperty("up")) {
            // call up() for eventCodeObj
            eventCodeObj.up();
            // remove all eventCodeObj instances from the current stack
            context.eventCodeStack = context.eventCodeStack.filter((x) => x !== eventCodeObj);
            // call down in insertion order for each eventCodeObj left in the stack
            context.eventCodeStack.forEach((eventCodeObj) => eventCodeObj.down());
          }
        }
      },
      false
    );
  }
}

/**
 * Controller class for click inputs.
 */
export class MouseController {
  clickMap;
  clickStack;

  constructor() {
    /**
     * Initialize on-screen click inputs map.
     */
    this.clickMap = Object.fromEntries(
      ClickableElementIds.map((x) => [x, { id: x, elem: document.getElementById(id), pressed: false }])
    );
    /**
     * Initialize click stack. This will track the most recent clicks to
     * prevent overwriting prior click events.
     */
    this.clickStack = [];
  }

  /**
   * Attaches click event handlers to mouse and touch event listeners.
   */
  attachListenersAndHandlers() {
    const opts = { passive: false };
    for (const [_, el] of Object.entries(this.clickMap)) {
      el.elem.addEventListener("mousedown", el.press, opts);
      el.elem.addEventListener("touchstart", el.press, opts);
      el.elem.addEventListener("mouseup", el.depress, opts);
      el.elem.addEventListener("touchend", el.depress, opts);
    }
  }
}
