/*
 * 为 script 标签注入拦截逻辑
 * @Author: lilonglong
 * @Date: 2022-01-20 22:06:38
 * @Last Modified by: lilonglong
 * @Last Modified time: 2022-03-15 15:44:52
 */
import VmContext from '../VmContext.js';
/**
 * 包装 addEventListener
 */
const addEventListener = (el, originEvent) => (type, listener, options) => {
    const listeners = el._listenerMap.get(type) || [];
    el._listenerMap.set(type, [...listeners, listeners]);
    return originEvent.apply(el, [type, listener, options]);
};
/**
 * 包装 removeEventListener
 */
const removeEventListener = (el, originEvent) => (type, listener, options) => {
    const storedTypeListeners = el._listenerMap.get(type);
    if (storedTypeListeners &&
        storedTypeListeners.length &&
        storedTypeListeners.indexOf(listener) !== -1) {
        storedTypeListeners.splice(storedTypeListeners.indexOf(listener), 1);
    }
    return originEvent.apply(el, [type, listener, options]);
};
const elProperties = ['innerHTML', 'text', 'innerText'];
/**
 * 为 script 标签注入拦截逻辑
 * @param el
 */
export const injectHTMLScriptElement = (el) => {
    el._listenerMap = new Map();
    el._evalScriptInSandbox = true;
    el.addEventListener = addEventListener(el, el.addEventListener);
    el.removeEventListener = removeEventListener(el, el.removeEventListener);
    elProperties.forEach(property => {
        Object.defineProperty(el, property, {
            get: function get() {
                return this.scriptText || '';
            },
            set: function set(value) {
                this.scriptText = value;
                // 如果是已经插入到 dom 树里面，则直接执行代码
                if (el.parentNode) {
                    const vm = this.ownerVmContext;
                    if (vm) {
                        VmContext.loadScripts({
                            url: el.src,
                            vm,
                            code: value.toString(),
                        });
                    }
                }
            },
            enumerable: false,
        });
    });
};
