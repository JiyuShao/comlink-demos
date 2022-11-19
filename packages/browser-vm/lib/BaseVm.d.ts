import VmContext from './VmContext';
/**
 * 自定义拦截某些属性的 proxy
 */
interface ProxyPropsInterceptorOptions<T> {
    /** 是否拦截某属性 */
    has: (target: T, prop: PropertyKey) => boolean;
    /** prop getter */
    get?: (target: T, prop: PropertyKey) => any;
    /** prop setter */
    set?: (target: T, prop: PropertyKey, value: any) => any;
}
interface ProxyPropsInterceptorOptionsChain<T> {
    handler: ProxyPropsInterceptorOptions<T>;
    pre?: ProxyPropsInterceptorOptionsChain<T>;
}
export default class BaseVm<T extends object = {}> {
    /** 当前 proxy 后的 object */
    instance: T | undefined | null;
    /** 支持自定义属性拦截器 */
    protected proxyInterceptorChain: ProxyPropsInterceptorOptionsChain<T> | undefined | null;
    protected context: VmContext | undefined | null;
    constructor(context: VmContext);
    clone(context: VmContext): any;
    /** 自定义属性拦截器 */
    setProxyInterceptor(handler: ProxyPropsInterceptorOptions<T>): void;
    /** 该 prop 是否设置了 set interceptor */
    protected hasSetPropSetter(target: T, prop: PropertyKey, chain?: ProxyPropsInterceptorOptionsChain<T>): boolean;
    /** 该 prop 是否设置了 get interceptor */
    protected hasSetPropGetter(target: T, prop: PropertyKey, chain?: ProxyPropsInterceptorOptionsChain<T>): boolean;
    /** 通过 interceptor 为该 prop setValue */
    protected setPropValueByChain(target: T, prop: PropertyKey, value: any, chain?: ProxyPropsInterceptorOptionsChain<T>): boolean;
    /** 通过 interceptor 获取 prop 的 value */
    protected getPropValueByChain(target: T, prop: PropertyKey, chain?: ProxyPropsInterceptorOptionsChain<T>): any;
    /** 销毁 */
    destroy(): any;
}
export {};
