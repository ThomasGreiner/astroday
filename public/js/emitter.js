class Emitter {
  constructor() {
    this._listeners = new Map();
  }
  
  dispatch(name) {
    let listeners = this._listeners.get(name);
    if (!listeners)
      return;
    
    for (let listener of listeners) {
      listener();
    }
  }
  
  on(name, listener) {
    let listeners = this._listeners.get(name);
    if (!listeners) {
      listeners = [];
      this._listeners.set(name, listeners);
    }
    listeners.push(listener);
  }
}
export {Emitter};
