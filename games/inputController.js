export class inputController {
  keyMap;
  clickMap;

  constructor() {
    this.keyMap = {};
    this.clickMap = {};
  }

  bind() {
    /**
     * Keyboard inputs.
     */
    this.keyMap = {
      w: {
        code: "KeyW",
        up: () => console.log("keyup > KeyW"),
        down: () => console.log("keydown > KeyW"),
      },
      a: {
        code: "KeyA",
        up: () => console.log("keyup > KeyA"),
        down: () => console.log("keydown > KeyA"),
      },
      s: {
        code: "KeyS",
        up: () => console.log("keyup > KeyS"),
        down: () => console.log("keydown > KeyS"),
      },
      d: {
        code: "KeyD",
        up: () => console.log("keyup > KeyD"),
        down: () => console.log("keydown > KeyD"),
      },
      p: {
        code: "KeyP",
        up: () => console.log("keyup > KeyP"),
        down: () => console.log("keydown > KeyP"),
      },
      " ": {
        code: "Space",
        up: () => console.log("keyup > Space"),
        down: () => console.log("keydown > Space"),
      },
      ArrowLeft: {
        code: "ArrowLeft",
        up: () => console.log("keyup > ArrowLeft"),
        down: () => console.log("keydown > ArrowLeft"),
      },
      ArrowUp: {
        code: "ArrowUp",
        up: () => console.log("keyup > ArrowUp"),
        down: () => console.log("keydown > ArrowUp"),
      },
      ArrowRight: {
        code: "ArrowRight",
        up: () => console.log("keyup > ArrowRight"),
        down: () => console.log("keydown > ArrowRight"),
      },
      ArrowDown: {
        code: "ArrowDown",
        up: () => console.log("keyup > ArrowDown"),
        down: () => console.log("keydown > ArrowDown"),
      },
    };
    /**
     * On-screen click inputs.
     */
    this.clickMap = {
      leftarrow: {
        ref: document.getElementById("leftarrow"),
        press: () => console.log("mousedown touchstart"),
        depress: () => console.log("mouseup touchend"),
      },
      uparrow: {
        ref: document.getElementById("uparrow"),
        press: () => console.log("mousedown touchstart"),
        depress: () => console.log("mouseup touchend"),
      },
      rightarrow: {
        ref: document.getElementById("rightarrow"),
        press: () => console.log("mousedown touchstart"),
        depress: () => console.log("mouseup touchend"),
      },
      downarrow: {
        ref: document.getElementById("downarrow"),
        press: () => console.log("mousedown touchstart"),
        depress: () => console.log("mouseup touchend"),
      },
    };
  }

  attach() {
    let context = this;
    document.addEventListener(
      "keydown",
      (e) => {
        e.preventDefault();
        if (context.keyMap[e.key] && !e.repeat) context.keyMap[e.key].down();
      },
      false
    );
    document.addEventListener(
      "keyup",
      (e) => {
        e.preventDefault();
        if (context.keyMap[e.key] && !e.repeat) context.keyMap[e.key].up();
      },
      false
    );
    for (const [_, el] of Object.entries(this.clickMap)) {
      el.ref.addEventListener("mousedown", el.press);
      el.ref.addEventListener("touchstart", el.press);
      el.ref.addEventListener("mouseup", el.depress);
      el.ref.addEventListener("touchend", el.depress);
    }
  }
}
