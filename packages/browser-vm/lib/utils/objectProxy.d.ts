declare class ObjectProxy<T extends {
    [x: string]: any;
} = {}> {
    /** 要代理的对象 */
    private target;
    /** 代理 handler，这里为了方便直接取 ProxyHandler 类型 */
    private handler;
    /** 要代理哪些属性  */
    private extraProps;
    constructor(target: T, handler: ProxyHandler<T>, extraProps?: string[]);
    /** 创建代理对象 */
    private createProxy;
    /** 递归 observe 原型 */
    private observeProto;
    /** observe 对象所有 own 属性 */
    private observeProperties;
    /** observe 指定属性 */
    private observeExtraProps;
    /** observeProperty */
    private observeProperty;
    /** 调用 handler.get */
    private internalGet;
    /** 调用 handler.set */
    private internalSet;
}
declare const _default: typeof ObjectProxy | ProxyConstructor;
export default _default;
