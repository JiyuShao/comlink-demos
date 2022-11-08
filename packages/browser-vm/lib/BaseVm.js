export default class BaseVm {
    /** 当前 proxy 后的 object */
    instance;
    /** 支持自定义属性拦截器 */
    proxyInterceptorChain;
    context;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    constructor(context) {
        this.context = context;
    }
    // @ts-ignore
    clone(context) {
        const cloned = new this.constructor(context);
        /** 继承 proxyInterceptorChain */
        if (this.proxyInterceptorChain) {
            cloned.proxyInterceptorChain = { ...this.proxyInterceptorChain };
        }
        return cloned;
    }
    /** 自定义属性拦截器 */
    setProxyInterceptor(handler) {
        if (!this.proxyInterceptorChain) {
            this.proxyInterceptorChain = {
                handler,
                pre: undefined,
            };
        }
        else {
            const curr = this.proxyInterceptorChain;
            this.proxyInterceptorChain = {
                handler,
                pre: curr,
            };
        }
    }
    /** 该 prop 是否设置了 set interceptor */
    hasSetPropSetter(target, prop, chain) {
        let currChain = chain;
        if (!currChain) {
            if (!this.proxyInterceptorChain) {
                return false;
            }
            currChain = this.proxyInterceptorChain;
        }
        const proxyInterceptor = currChain.handler;
        /** 如果当前有拦截 prop set 代理 */
        if (proxyInterceptor.has(target, prop) && proxyInterceptor.set) {
            return true;
        }
        // 否则继续向上回溯递归，直到 pre 为 undefined
        if (currChain.pre) {
            return this.hasSetPropSetter(target, prop, currChain.pre);
        }
        return false;
    }
    /** 该 prop 是否设置了 get interceptor */
    hasSetPropGetter(target, prop, chain) {
        let currChain = chain;
        if (!currChain) {
            if (!this.proxyInterceptorChain) {
                return false;
            }
            currChain = this.proxyInterceptorChain;
        }
        const proxyInterceptor = currChain.handler;
        /** 如果当前有拦截 prop set 代理 */
        if (proxyInterceptor.has(target, prop) && proxyInterceptor.get) {
            return true;
        }
        // 否则继续向上回溯递归，直到 pre 为 undefined
        if (currChain.pre) {
            return this.hasSetPropGetter(target, prop, currChain.pre);
        }
        return false;
    }
    /** 通过 interceptor 为该 prop setValue */
    setPropValueByChain(target, prop, value, chain) {
        let currChain = chain;
        if (!currChain) {
            if (!this.proxyInterceptorChain) {
                return true;
            }
            currChain = this.proxyInterceptorChain;
        }
        const proxyInterceptor = currChain.handler;
        /** 如果当前有拦截 prop set 代理 */
        if (proxyInterceptor.has(target, prop) && proxyInterceptor.set) {
            /** set value */
            proxyInterceptor.set(target, prop, value);
            return true;
        }
        // 继续向上回溯递归，直到 pre 为 undefined
        if (currChain.pre) {
            return this.setPropValueByChain(target, prop, value, currChain.pre);
        }
        return true;
    }
    /** 通过 interceptor 获取 prop 的 value */
    getPropValueByChain(target, prop, chain) {
        let currChain = chain;
        if (!currChain) {
            if (!this.proxyInterceptorChain) {
                return undefined;
            }
            currChain = this.proxyInterceptorChain;
        }
        const proxyInterceptor = currChain.handler;
        /** 如果当前有拦截 prop set 代理 */
        if (proxyInterceptor.has(target, prop) && proxyInterceptor.get) {
            /** get value */
            return proxyInterceptor.get(target, prop);
        }
        // 继续向上回溯递归，直到 pre 为 undefined
        if (currChain.pre) {
            return this.getPropValueByChain(target, prop, currChain.pre);
        }
        return undefined;
    }
    /** 销毁 */
    destroy() {
        this.instance = null;
        this.context = null;
        /** 清除自定义属性拦截器 */
        this.proxyInterceptorChain = null;
    }
}
