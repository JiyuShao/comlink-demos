import "/shadowrealm-api/polyfill.js";
import * as Comlink from "/local-comlink/comlink.mjs";
// import { wrap } from "/comlink/esm/string-channel.experimental.js";

const sr = new ShadowRealm();

const API = {};

async function initCommunication() {
  const messageListeners = [];
  API.addMessageListener = (handler) => {
    messageListeners.push(handler);
  };
  API.removeMessageListener = (handler) => {
    // TODO
  };

  const send = (msg) => {
    messageListeners.forEach((handler) => {
      handler(JSON.parse(msg));
    });
  };

  // 注入 send 方法到沙箱
  const injectSend = await sr.evaluate(`
    globalThis.API = { messageListeners: [] };
    (send) => {
      globalThis.API.send = (msg) =>
        send(
          JSON.stringify({
            data: msg,
          })
        );
    };  
  `);
  injectSend(send);

  // 注入 send 方法到宿主
  const origionalSend = await sr.evaluate(`
    globalThis.API.addMessageListener = (handler) => {
      globalThis.API.messageListeners.push(handler);
    };
    globalThis.API.removeMessageListener = (handler) => {
      // TODO
    };
    (msg) => {
      globalThis.API.messageListeners.forEach(handler => {
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

  // 测试通信代码
  API.addMessageListener((message) => {
    console.log("host received:", message);
  });

  await sr.evaluate(`
    globalThis.API.send({
      msg: 'message from sandbox'
    });
    '';
  `);

  await sr.evaluate(`
    globalThis.API.addMessageListener(message => {
      console.log('shadow realm received:', message);
    });
  `);

  API.send({
    msg: "message from host",
  });
}

// 测试 comlink 代码
async function initComlink() {
  // 该 js 将 Comlink 注入到 globalThis
  await sr.importValue("/local-comlink/comlink.mjs", "expose");
  // await sr.importValue('/local-comlink/string-channel.experimental.mjs', 'wrap');

  const sandboxApi = Comlink.wrap(customEndpoint(API));

  await sr.evaluate(`
    const testObj = {
      name: 'test',
      testFn: (...args) => {
        console.log('### run sandbox testFn, args:', args);
        return {
          type: 'testFn return',
          value: {
            a: 1,
            b: 2
          },
          testReturnFn: () => console.log('### testReturnFn')
        }
      }
    };
    Comlink.expose(testObj, {
      postMessage: (msg) => {
        globalThis.API.send(msg);
      },
      addEventListener: (type, handler) => {
        if (type === 'message') {
          globalThis.API.addMessageListener(handler);
        }
      }
    });
    '';
  `);
  const result = await sandboxApi.testFn(1, "2");
  console.log("### await sandboxApi.testFn", result);
  // 通信是通过 string 来进行通信的，目前只封装一层，后续有需要可优化
  // result.testReturnFn();
  console.log("### await sandboxApi.name", await sandboxApi.name);
}

function customEndpoint(api) {
  return {
    postMessage: (msg) => api.send(msg),
    addEventListener: (type, handler) => {
      if (type === "message") {
        api.addMessageListener(handler);
      }
    },
    removeEventListener: (type, handler) => {
      if (type === "message") {
        api.removeMessageListener(handler);
      }
    },
  };
}

initCommunication();
initComlink();
