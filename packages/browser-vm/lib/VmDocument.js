/*
 * 代理 document 对象
 * @Author: lilonglong
 * @Date: 2022-01-20 22:06:38
 * @Last Modified by: lilonglong
 * @Last Modified time: 2022-03-16 19:34:09
 */
import BaseVm from './BaseVm.js';
import { injectHTMLScriptElement, } from './utils/HTMLScriptElement.js';
import ObjectProxy from './utils/objectProxy.js';
class VmDocument extends BaseVm {
    /** vm document instance */
    instance;
    /** eventListeners */
    eventListeners = [];
    constructor(context) {
        super(context);
        if (!context.options) {
            throw new Error('VmDocument init error');
        }
        const options = {
            ...context.options,
            /** 默认允许 script escape */
            enableScriptEscape: typeof context.options.enableScriptEscape === undefined
                ? true
                : context.options.enableScriptEscape,
        };
        // eslint-disable-next-line @typescript-eslint/no-this-alias
        const self = this;
        const proxyHandler = {
            set(target, name, value) {
                /** 是否拦截处理 */
                if (self.hasSetPropSetter(target, name)) {
                    return self.setPropValueByChain(target, name, value);
                }
                switch (name) {
                    case 'cookie':
                        // TODO 这里可以特殊处理下cookie 比如加上namespace, 防止cookie污染或冲突
                        document.cookie = value;
                        break;
                    default:
                        // @ts-ignore
                        target[name] = value;
                }
                return true;
            },
            get(target, name) {
                /** 是否拦截处理 */
                if (self.hasSetPropGetter(target, name)) {
                    return self.getPropValueByChain(target, name);
                }
                // eslint-disable-next-line default-case
                switch (name) {
                    /** 返回代理的 body location defaultView */
                    case 'body':
                        return context.body;
                    case 'location':
                        return context.location?.instance;
                    case 'defaultView':
                        return context.window?.instance;
                    case 'write':
                    case 'writeln':
                        // 禁用
                        if (process.env.NODE_ENV === 'test') {
                            return null;
                        }
                        return () => { };
                    /** 拦截 createElement */
                    case 'createElement':
                        return (...args) => {
                            const el = target.createElement(...args);
                            /**  如果是 scipt 标签,并且不允许 script 沙箱逃逸, 则直接 hack script 标签 */
                            if (el.tagName === 'SCRIPT' && !options.enableScriptEscape) {
                                /** 给 element 打上标记 */
                                el.ownerVmContext = context;
                                el.appId = options.appId;
                                injectHTMLScriptElement(el);
                            }
                            return el;
                        };
                    case 'addEventListener':
                        return (...args) => {
                            self.eventListeners.push(args);
                            return target.addEventListener(...args);
                        };
                }
                if (typeof target[name] === 'function') {
                    // @ts-ignore
                    return target[name].bind && target[name].bind(target);
                }
                return target[name];
            },
        };
        // @ts-ignore
        this.instance = new ObjectProxy(document, proxyHandler);
    }
    /**
     * 设置 document.currentScript 拦截器
     * 兼容 webpack 的 hmr publicPath 相关逻辑
     */
    setCurrentScriptInterceptor(currScript) {
        let currentScript = currScript;
        this.setProxyInterceptor({
            has(_target, prop) {
                if (prop === 'currentScript') {
                    return true;
                }
                return false;
            },
            get(_target, prop) {
                if (prop === 'currentScript') {
                    return currentScript;
                }
                return undefined;
            },
            set(_target, prop, value) {
                if (prop === 'currentScript') {
                    currentScript = value;
                }
            },
        });
    }
    destory() {
        super.destroy();
        for (const args of this.eventListeners) {
            this.instance?.removeEventListener(...args);
        }
    }
}
export default VmDocument;
