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
 * Controller class for keyboard and click inputs.
 */
export class InputController {
  eventKeyMap;
  eventKeyStack;

  eventCodeMap;
  eventCodeStack;

  clickMap;
  clickStack;

  constructor() {
    /**
     * Initialize event key map.
     */
    this.eventKeyMap = Object.fromEntries(KeyboardEventKeys.map((x) => [x, {}]));
    /**
     * Initialize event key stack. This will track the most recent event key
     * pressed to prevent overwriting prior key press events.
     */
    this.eventKeyStack = [];
    /**
     * Initialize event code map.
     */
    this.eventCodeMap = Object.fromEntries(KeyboardEventCodes.map((x) => [x, {}]));
    /**
     * Initialize event code stack. This will track the most recent event code
     * pressed to prevent overwriting prior code press events.
     */
    this.eventCodeStack = [];
    /**
     * Initialize on-screen click inputs map.
     */
    this.clickMap = Object.fromEntries(ClickableElementIds.map((x) => [x, {}]));
    /**
     * Initialize click stack. This will track the most recent clicks to
     * prevent overwriting prior click events.
     */
    this.clickStack = [];
  }

  /**
   * Attaches keydown and keyup event handlers to keystroke event listeners.
   */
  attachKeyboardListenersAndHandlers() {
    let context = this;
    Object.getOwnPropertyNames(this.eventKeyMap).forEach((key) => {
      let value = context.eventKeyMap[key];
      value.key = key; // set reference to key name
    });
    Object.getOwnPropertyNames(this.eventCodeMap).forEach((key) => {
      let value = context.eventCodeMap[key];
      value.code = key; // set reference to key name
    });
    document.addEventListener(
      "keydown",
      (e) => {
        e.preventDefault(); // prevent default behavior to avoid unexpected page updates
        if (!e.repeat) {
          if (context.eventKeyMap[e.key] && context.eventKeyMap[e.key].hasOwnProperty("down")) {
            context.eventKeyMap[e.key].down(); // call down() for key event
            context.eventKeyStack.push(context.eventKeyMap[e.key]); // add key to key stack
          }
          if (context.eventCodeMap[e.code] && context.eventCodeMap[e.code].hasOwnProperty("down")) {
            context.eventCodeMap[e.code].down(); // call down() for code event
            context.eventCodeStack.push(context.eventCodeMap[e.code]); // add code to code stack
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
          if (context.eventKeyMap[e.key] && context.eventKeyMap[e.key].hasOwnProperty("up")) {
            context.eventKeyMap[e.key].up(); // call up() for key event
            remove(context.eventKeyStack, context.eventKeyMap[e.key]); // remove key event from the current stack
            context.eventKeyStack.forEach((key) => key.down()); // call down in insertion order for each key event in the stack
          }
          if (context.eventCodeMap[e.code] && context.eventCodeMap[e.code].hasOwnProperty("up")) {
            context.eventCodeMap[e.code].up(); // call up() for code event
            remove(context.eventCodeStack, context.eventCodeMap[e.code]); // remove code event from the current stack
            context.eventCodeStack.forEach((code) => code.down()); // call down in insertion order for each code event in the stack
          }
        }
      },
      false
    );
  }

  /**
   * Attaches click event handlers to mouse and touch event listeners.
   */
  attachClickListenersAndHandlers() {
    let context = this;
    Object.getOwnPropertyNames(this.clickMap).forEach((id) => {
      let value = context.clickMap[id];
      value.id = id; // set reference to id name
      value.elem = document.getElementById(id); // get document element object
      value.pressed = false; // set pressed state flag
    });
    const opts = { passive: false };
    for (const [_, el] of Object.entries(this.clickMap)) {
      el.elem.addEventListener("mousedown", el.press, opts);
      el.elem.addEventListener("touchstart", el.press, opts);
      el.elem.addEventListener("mouseup", el.depress, opts);
      el.elem.addEventListener("touchend", el.depress, opts);
    }
  }
}

/**
 * Remove `element` from `array`.
 * @param {Array} array Array of values.
 * @param {any} element Element to remove from array.
 */
function remove(array, element) {
  const index = array.indexOf(element);
  if (index > -1) {
    array.splice(index, 1);
  }
}
