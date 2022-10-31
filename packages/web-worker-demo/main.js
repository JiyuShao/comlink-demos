import * as Comlink from "https://unpkg.com/comlink/dist/esm/comlink.mjs";
async function init() {
  const worker = new Worker("worker.js");
  // WebWorkers use `postMessage` and therefore work with Comlink.
  const obj = Comlink.wrap(worker);
  console.warn(`obj.counter: ${await obj.counter}`);
  console.warn(`obj.inc(): ${await obj.inc()}`);
  console.warn(`obj.counter: ${await obj.counter}`);
  console.warn(
    `obj.log: ${await obj.log(
      "testMessage",
      Comlink.proxy({
        testNumber: 1,
        testFn: (...args) => {
            console.warn('testFn called by worker, args:', args)
        },
        testObject: {
          aaa: 1,
        },
      })
    )}`
  );
}
init();
