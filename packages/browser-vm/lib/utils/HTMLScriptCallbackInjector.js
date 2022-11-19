/*
 * 兼容沙箱环境下 jsonp 的逻辑
 * @Author: lilonglong
 * @Date: 2022-01-20 22:06:38
 * @Last Modified by: lilonglong
 * @Last Modified time: 2022-03-16 19:28:42
 */
/**
 * 根据 src 获取 jsonp callbackname
 */
export const getJsonCallbackName = (src) => {
    let u;
    try {
        u = new URL(src);
    }
    catch (e) {
        return null;
    }
    const sp = u.searchParams;
    if (!sp)
        return null;
    return sp.get('callback') || sp.get('cb');
};
/**
 * 沙箱环境 jsonp 处理
 * @param {InjectedHtmlScriptElement} scriptEl
 */
const injectScriptCallback = (scriptEl) => {
    setTimeout(() => {
        if (!scriptEl.src)
            return;
        const appWindow = scriptEl.ownerVmContext.window?.instance;
        const callbackName = getJsonCallbackName(scriptEl.src);
        // @ts-ignore
        if (callbackName && typeof appWindow[callbackName] === 'function') {
            // @ts-ignore
            window[callbackName] = function (...args) {
                // @ts-ignore
                const result = appWindow[callbackName].apply(this, args);
                // @ts-ignore
                window[callbackName] = null;
                return result;
            };
        }
    }, 0);
};
export default injectScriptCallback;
