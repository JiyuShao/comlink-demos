importScripts("https://unpkg.com/comlink/dist/umd/comlink.js");
// importScripts("../../../dist/umd/comlink.js");

const obj = {
  counter: 0,
  inc() {
    this.counter++;
    return this.counter;
  },
  log(...args) {
    // message
    console.error(...args);
    args[1].testFn.call(this, [1, 2, 3]);
  },
};

Comlink.expose(obj);
