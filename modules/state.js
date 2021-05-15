export class GameState {
  constructor() {
    const methods = [
      // Setup and destroy the state
      [this.Init, "Init"],
      [this.Cleanup, "Cleanup"],
      // Used when temporarily transitioning to another state
      [this.Pause, "Pause"],
      [this.Resume, "Resume"],
      // The three important actions within a game loop
      [this.HandleEvents, "HandleEvents"],
      [this.Update, "Update"],
      [this.Draw, "Draw"],
    ];
    const mask = methods.map((method) => method[0] === undefined);
    const filtered = methods.filter((_, i) => mask[i]);
    if (filtered.length)
      throw new TypeError(
        `Missing methods: ${filtered.map((method) => method[1])}`
      );
  }
}

export class GameEngine {
  states; // the stack of states
  running; // bool whether game is running or not

  constructor() {
    const methods = [
      // Creating and destroying the state machine
      [this.Init, "Init"],
      [this.Cleanup, "Cleanup"],
      // Transit between states
      [this.ChangeState, "ChangeState(state)"],
      [this.PushState, "PushState(state)"],
      [this.PopState, "PopState"],
      // The three important actions within a game loop
      // (these will be handled by the top state in the stack)
      [this.HandleEvents, "HandleEvents"],
      [this.Update, "Update"],
      [this.Draw, "Draw"],
    ];
    const mask = methods.map((method) => method[0] === undefined);
    const filtered = methods.filter((_, i) => mask[i]);
    if (filtered.length)
      throw new TypeError(
        `Missing methods: ${filtered.map((method) => method[1])}`
      );
  }

  /**
   * engine status
   */
  Running() {
    return running;
  }

  Quit() {
    running = false;
  }
}
