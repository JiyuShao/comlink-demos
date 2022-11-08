/*
 * 替换element的 "appendChild", "insertBefore", "append“方法,
 * 拦截 动态加载的 script 标签,确保代码在沙箱内执行
 * @Author: lilonglong
 * @Date: 2022-01-20 22:06:38
 * @Last Modified by: lilonglong
 * @Last Modified time: 2022-03-18 14:40:54
 */
import injectScriptCallback, { getJsonCallbackName, } from './utils/HTMLScriptCallbackInjector.js';
import VmContext from './VmContext.js';
const makeElInjector = (orignMethod) => function (el, ...args) {
    if (el.nodeName === 'SCRIPT' && el.ownerVmContext) {
        const scriptEl = el;
        /**
         * 如果不在script 资源白名单内, 并且不是 jsonp 资源
         */
        const needLoadscriptsInSandbox = scriptEl._evalScriptInSandbox &&
            scriptEl.nodeName === 'SCRIPT' &&
            scriptEl.src &&
            !scriptEl.ownerVmContext.options?.allowScriptResources?.includes(scriptEl.src) &&
            !getJsonCallbackName(scriptEl.src);
        /**
         * 如果不在全局资源加载白名单上,并且开启了 沙箱执行script,
         * 则通过 vmContext 动态加载script 并执行
         */
        if (needLoadscriptsInSandbox) {
            return VmContext.loadScripts({
                url: scriptEl.src,
                vm: scriptEl.ownerVmContext,
            })
                .then(() => {
                // 派发 onload 事件
                scriptEl.dispatchEvent(new Event('load'));
            })
                .catch(e => {
                console.error(e);
                // 派发 onerror 事件
                scriptEl.dispatchEvent(new ErrorEvent('error', {
                    error: e,
                    message: e.meesage,
                }));
            });
        }
        // 兼容 jsonp
        injectScriptCallback(scriptEl);
        // 如果有 scriptText, 则表示元素在 插入前已经被设置了 text,
        // 则直接在沙箱执行
        if (scriptEl.scriptText) {
            return VmContext.loadScripts({
                url: scriptEl.src,
                vm: scriptEl.ownerVmContext,
                code: scriptEl.scriptText,
            });
        }
    }
    // 返回原函数
    // @ts-ignore
    return orignMethod.call(this, el, ...args);
};
if (typeof window.Element === 'function') {
    const mountElementMethods = ['appendChild', 'insertBefore', 'append'];
    for (const method of mountElementMethods) {
        // @ts-ignore
        const originMethod = window.Element.prototype[method];
        // @ts-ignore
        window.Element.prototype[method] = makeElInjector(originMethod);
    }
}
