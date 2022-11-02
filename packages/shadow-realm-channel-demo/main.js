import "/shadowrealm-api/polyfill.js";
import * as Comlink from "/comlink/esm/comlink.mjs";
import { wrap } from "/comlink/esm/string-channel.experimental.mjs";
import nodeEndpoint from '/comlink/esm/node-adapter.mjs';

const sr = new ShadowRealm();

const API = {};

async function initCommunication() {
  API.msgHandlers = [];
  API.onMessageListener = (handler) => {
    API.msgHandlers.push(handler);
  };
  API.removeMessageListener = () => {}

  const send = (msg) => {
    API.msgHandlers.forEach((handler) => {
      handler(JSON.parse(msg));
    });
  };

  const injectSend = await sr.evaluate(`
    globalThis.API = { msgHandlers: [] };
    (send) => {
      globalThis.API.send = (msg) => {
        send(
          JSON.stringify({
            data: msg,
          })
        );
      }
    };
  `);
  injectSend(send);

  // 注入 send 方法到宿主
  const origionalSend = await sr.evaluate(`
    globalThis.API.onMessageListener = (handler) => {
      globalThis.API.msgHandlers.push(handler);
    };
    (msg) => {
      globalThis.API.msgHandlers.forEach(handler => {
        handler(JSON.parse(msg));
      });
    };
  `);

  API.send = async function (msg) {
    return origionalSend(
      JSON.stringify({
        data: msg,
      })
    );
  };

    // 测试代码
  API.onMessageListener((message) => {
    console.log("host received:", message);
  });

  await sr.evaluate(`
    globalThis.API.send('message from sandbox');
    '';
  `);

  await sr.evaluate(`
    globalThis.API.onMessageListener(message => {
      console.log('shadow realm received:', message);
    });
  `)

  API.send("message from host");
}

async function initComlink() {
  // 注入 Comlink 到 globalThis
  await sr.importValue('/local-comlink/comlink.mjs', 'expose');
  // 注入 MessageChannle、MessagePort 到 globalThis
  await sr.importValue('/local-comlink/message-channel.mjs', 'applyPolyfill');
  // 注入 nodeEndpoint 到 globalThis
  // await sr.importValue('/local-comlink/node-adapter.mjs', 'default');
  // 注入 wrap 到 globalThis
  await sr.importValue('/local-comlink/string-channel.experimental.mjs', 'wrap');

  const hostEndpoint = wrap({
    addMessageListener(f) {
      API.onMessageListener((ev) => f(ev.data) );
    },
    send(msg) {
      API.send(msg);
    },
  });

  const api = Comlink.wrap(hostEndpoint);

  await sr.evaluate(`
    const realmObj = {
      name: 'test',
      obj: {
        a: 'aa',
        b: 'bb'
      },
      f: function() {
        console.log('f exec')
        return 'it is f return';
      }
    };
    const realmEndpoint = wrap({
      addMessageListener(f) {
        API.onMessageListener((ev) => f(ev.data));
      },
      send(msg) {
        API.send(msg);
      },
    });
    globalThis.realmEndpoint = realmEndpoint;
    Comlink.expose(realmObj, realmEndpoint);
    '';
  `)

  console.log(await api.f());
}

initCommunication();
initComlink();
