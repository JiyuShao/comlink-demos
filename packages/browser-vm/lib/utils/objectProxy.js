/*
 * 简易版 Proxy 实现，仅支持 object proxy
 * @Author: lilonglong
 * @Date: 2022-03-07 22:21:07
 * @Last Modified by: lilonglong
 * @Last Modified time: 2022-03-09 17:16:06
 * @reference https://github.com/ambit-tsai/es6-proxy-polyfill
 */
class ObjectProxy {
    /** 要代理的对象 */
    target;
    /** 代理 handler，这里为了方便直接取 ProxyHandler 类型 */
    handler;
    /** 要代理哪些属性  */
    extraProps = [];
    constructor(target, handler, extraProps) {
        this.target = target;
        this.extraProps = extraProps || [];
        this.handler = handler;
        /** 返回代理处理过的对象 */
        // eslint-disable-next-line no-constructor-return
        return this.createProxy();
    }
    /** 创建代理对象 */
    createProxy() {
        let descMap = this.observeProto();
        const newProto = Object.create(Object.getPrototypeOf(this.target), descMap);
        descMap = this.observeProperties(this.target);
        descMap = {
            ...descMap,
            ...this.observeExtraProps(),
        };
        return Object.create(newProto, descMap);
    }
    /** 递归 observe 原型 */
    observeProto() {
        const descMap = {};
        let proto = Object.getPrototypeOf(this.target);
        while (proto) {
            const props = this.observeProperties(proto);
            Object.assign(descMap, props);
            proto = Object.getPrototypeOf(proto);
        }
        return descMap;
    }
    /** observe 对象所有 own 属性 */
    observeProperties(obj) {
        const names = Object.getOwnPropertyNames(obj);
        const descMap = {};
        for (let i = names.length - 1; i >= 0; --i) {
            descMap[names[i]] = this.observeProperty(names[i]);
        }
        return descMap;
    }
    /** observe 指定属性 */
    observeExtraProps() {
        const descMap = {};
        this.extraProps.forEach(prop => {
            descMap[prop] = this.observeProperty(prop);
        });
        return descMap;
    }
    /** observeProperty */
    observeProperty(prop) {
        const desc = Object.getOwnPropertyDescriptor(this.target, prop);
        // eslint-disable-next-line @typescript-eslint/no-this-alias
        const self = this;
        return {
            get() {
                return self.internalGet(prop, this);
            },
            set(value) {
                self.internalSet(prop, value, this);
            },
            enumerable: !!desc?.enumerable,
            configurable: !!desc?.configurable,
        };
    }
    /** 调用 handler.get */
    internalGet(prop, receiver) {
        if (this.handler?.get === undefined) {
            return this.target[prop];
        }
        return this.handler.get(this.target, prop, receiver);
    }
    /** 调用 handler.set */
    internalSet(prop, value, receiver) {
        if (this.handler.set === undefined) {
            this.target[prop] = value;
        }
        else {
            return this.handler.set(this.target, prop, value, receiver);
        }
        return false;
    }
}
export default typeof Proxy !== 'undefined' ? Proxy : ObjectProxy;
