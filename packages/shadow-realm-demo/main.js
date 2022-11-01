import "/shadowrealm-api/polyfill.js";
import * as Comlink from "/local-comlink/comlink.mjs";
import { wrap } from "/comlink/esm/string-channel.experimental.js";

(function() {
  const sr = new ShadowRealm();

  const API = {};

  async function initCommunication() {
    const msgHandlers = [];
    API.onMessage = (handler) => {
      msgHandlers.push(handler);
    };

    const send = (msg) => {
      msgHandlers.forEach(handler => handler(msg));
    };

    const injectSend = await sr.evaluate(`
      globalThis.API = { msgHandlers: [] };
      (send) => {
        globalThis.API.send = send
      };
    `);
    injectSend(send);

    // 注入 send 方法到宿主
    API.send = await sr.evaluate(`
      globalThis.API.onMessage = (handler) => {
        globalThis.API.msgHandlers.push(handler);
      };
      (msg) => {
        globalThis.API.msgHandlers.forEach(handler => {
          handler(msg);
        });
      };
    `);

     // 测试代码
    API.onMessage((message) => {
      console.log("host received:", message);
    });

    await sr.evaluate(`
      globalThis.API.send('message from sandbox');
      '';
    `);

    await sr.evaluate(`
      globalThis.API.onMessage(message => {
        console.log('shadow realm received:', message);
      });
    `)

    API.send("message from host");
  }

  async function initComlink() {
    // 该 js 将 Comlink 注入到 globalThis
    await sr.importValue('/local-comlink/comlink.mjs', 'expose');
    // await sr.importValue('/local-comlink/string-channel.experimental.mjs', 'wrap');

    const api = Comlink.wrap(customEndpoint(API));

    await sr.evaluate(`
      const testObj = {
        name: 'test'
      };
      Comlink.expose(testObj, {
        postMessage: (msg) => API.send(msg),
        addEventListener: (type, handler) => {
          if (type === 'message') {
            API.onMessage(handler)
          }
        }
      });
      '';
    `)

    console.log(await api.name)
  }


  function customEndpoint(api) {
    return {
      postMessage: (msg) => api.send(msg),
      addEventListener: (type, handler) => {
        if (type === 'message') {
          api.onMessage(handler);
        }
      }
    };
  }

  initCommunication();
  initComlink();
})()

