import "/shadowrealm-api/polyfill.js";
import VmContext from  "/browser-vm/VmContext.js";
import { createVmContext } from '/browser-vm/index.js';

// 使用 shadow realm 执行代码
function execCodeByShadowRealm(code) {
  const realm = new ShadowRealm();
  return realm.evaluate(code);
}

// 使用 web worker 来执行代码
function execCodeByWorker(code) {
  const blob = new Blob([code], { type: 'application/javascript' });
  const codeWorker = new Worker(URL.createObjectURL(blob));
  return codeWorker;
}

// 使用 new function + fake iframe window + with 执行代码
async function execCodeByProxy(code) {
  const vm = await createVmContext({
    appId: 'appId1',
  })
  VmContext.evalScript(code, vm);
}

// 获取代码字符串
async function fetchCode(url) {
  if (!url) return '';
  try {
    const fetchResponse = await fetch(url);
    return fetchResponse.text();
  } catch (e) {
    console.log('Error');
    return '';
  }
}

const execFns = [
  execCodeByShadowRealm,
  execCodeByProxy
]
 
async function execPluginCode(code) {
  const fn = execFns[1]
  await fn(code);
}

// 测试加载执行插件代码
const code = await fetchCode(
  'http://localhost:8080/code.js'
);

const MAX_EXEC_COUNT = 100;
console.time();
for (let i = 0; i < MAX_EXEC_COUNT; i += 1) {
  await execPluginCode(code);
}
// console.log('codeByShadowRealm:');
console.log('codeByProxy:');
console.timeEnd();