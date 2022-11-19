/* eslint-disable no-eval */
/*
 * 代理 ifame.contentWindow 对象
 * @Author: lilonglong
 * @Date: 2022-01-20 22:06:38
 * @Last Modified by: lilonglong
 * @Last Modified time: 2022-08-31 14:15:51
 */
import BaseVm from './BaseVm.js';
import { addEventListener, removeEventListener } from './events.js';
import { isBoundedFunction, isConstructor } from './utils/common.js';
import { getLocalStorageOverride } from './utils/globalVarsOverrides.js';
import ObjectProxy from './utils/objectProxy.js';
const defaultExternalsVars = [
    'requestAnimationFrame',
    'webkitRequestAnimationFrame',
    'mozRequestAnimationFrame',
    'oRequestAnimationFrame',
    'msRequestAnimationFrame',
    'cancelAnimationFrame',
    'webkitCancelAnimationFrame',
    'mozCancelAnimationFrame',
    'oCancelAnimationFrame',
    'msCancelAnimationFrame',
];
/*
 variables who are impossible to be overwrite need to be escaped from proxy sandbox for performance reasons
 https://github.com/umijs/qiankun/blob/master/src/sandbox/proxySandbox.ts#L48
 */
const unscopables = {
    undefined: true,
    Array: true,
    Object: true,
    String: true,
    Boolean: true,
    Math: true,
    Number: true,
    Symbol: true,
    parseFloat: true,
    Float32Array: true,
    isNaN: true,
    Infinity: true,
    Reflect: true,
    Float64Array: true,
    Function: true,
    Map: true,
    NaN: true,
    Promise: true,
    Proxy: true,
    Set: true,
    parseInt: true,
    requestAnimationFrame: true,
};
class VmWindow extends BaseVm {
    constructor(context) {
        super(context);
        const { options, baseFrame } = context;
        if (!options || !baseFrame) {
            throw new Error('VmWindow init error');
        }
        const sandboxWindow = baseFrame.contentWindow;
        sandboxWindow.__IS_SANDBOX_CONTEXT__ = true;
        /** 处理 externalsVars */
        const externalVarNames = [];
        (options.externalsVars || []).forEach(external => {
            if (typeof external === 'string') {
                /** externalsVar 为 string 的情况 */
                externalVarNames.push(external);
            }
            else if (typeof external === 'object') {
                /** externalsVar 为 record 的情况 */
                sandboxWindow[external.key] = external.value;
            }
        });
        /** 合并允许访问到宿主全局作用域的变量名 */
        const externalsVars = [...defaultExternalsVars, ...externalVarNames];
        /**
         * 可以自定义额外覆盖某些全局变量到这个对象,
         * 例如 localStorage
         */
        const localStorageOverride = getLocalStorageOverride(options);
        const extraProps = [...externalsVars];
        // eslint-disable-next-line @typescript-eslint/no-this-alias
        const self = this;
        const proxyHandler = {
            has(_target, _p) {
                return true;
            },
            set(target, name, value) {
                /** 是否拦截处理 */
                if (self.hasSetPropSetter(target, name)) {
                    return self.setPropValueByChain(target, name, value);
                }
                // @ts-ignore
                target[name] = value;
                return true;
            },
            get(target, name) {
                if (name === Symbol.unscopables)
                    return unscopables;
                /** 是否拦截处理 */
                if (self.hasSetPropGetter(target, name)) {
                    return self.getPropValueByChain(target, name);
                }
                /** 需要引用外部全局变量 */
                if (externalsVars.includes(name)) {
                    const windowValue = window[name];
                    if (typeof windowValue === 'function') {
                        const bindFn = windowValue.bind(window);
                        for (const key in windowValue) {
                            bindFn[key] = windowValue[key];
                        }
                        return bindFn;
                    }
                    return windowValue;
                }
                // eslint-disable-next-line default-case
                switch (name) {
                    /** 拦截 沙箱window 上的 document location history 访问 */
                    case 'document':
                        return context.document?.instance;
                    case 'location':
                        return context.location?.instance;
                    case 'history':
                        return context.history?.instance;
                    /** window.window、window.globalThis、window.self 都返回自身 */
                    case 'window':
                    case 'globalThis':
                    case 'self':
                        return self.instance;
                    // 可以拦截 localStorage,增加标记等
                    case 'localStorage':
                        return localStorageOverride;
                    /** 拦截 window 上的事件监听 */
                    case 'addEventListener':
                        return addEventListener(context);
                    case 'removeEventListener':
                        return removeEventListener(context);
                    /**
                     * 返回宿主环境的 eval,避免 eval 作用域问题
                     * 因为宿主环境 eval 与 iframe.contentWindow.eval 的内部作用域是不同的
                     */
                    case 'eval': {
                        // @ts-ignore
                        return eval;
                    }
                    /**
                     * 需返回宿主环境的 RegExp,否则 RegExp.$n 会返回空字符串
                     * 详情见：index.test.ts "修复 RegExp.$n bug"
                     */
                    case 'RegExp': {
                        return RegExp;
                    }
                }
                const value = target[name];
                // 排除构造函数 和 已bind 的函数
                if (typeof value === 'function' &&
                    !isConstructor(value) &&
                    !isBoundedFunction(value)) {
                    return value.bind && value.bind(target);
                }
                return value;
            },
        };
        // @ts-ignore
        this.instance = new ObjectProxy(sandboxWindow, proxyHandler, extraProps);
    }
}
export default VmWindow;
