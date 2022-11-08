/*
 * 代理 location 对象
 * @Author: lilonglong
 * @Date: 2022-01-20 22:06:38
 * @Last Modified by: lilonglong
 * @Last Modified time: 2022-03-16 19:33:32
 */
import BaseVm from './BaseVm.js';
import ObjectProxy from './utils/objectProxy.js';
class VmLocation extends BaseVm {
    constructor(context) {
        super(context);
        if (!context.baseFrame) {
            throw new Error('VmLocation init error');
        }
        const { location } = context.baseFrame.contentWindow;
        // eslint-disable-next-line @typescript-eslint/no-this-alias
        const self = this;
        const proxyHandler = {
            set(target, name, value) {
                /** 是否拦截处理 */
                if (self.hasSetPropSetter(target, name)) {
                    return self.setPropValueByChain(target, name, value);
                }
                switch (name) {
                    // 禁止设置 location.href
                    case 'href':
                        if (process.env.NODE_ENV !== 'production') {
                            console.log('## 禁用 set location.href');
                        }
                        break;
                    default:
                        // @ts-ignore
                        location[name] = value;
                }
                return true;
            },
            get(target, name) {
                /** 是否拦截处理 */
                if (self.hasSetPropGetter(target, name)) {
                    return self.getPropValueByChain(target, name);
                }
                switch (name) {
                    // 禁用 reload replace
                    case 'reload':
                        return () => {
                            if (process.env.NODE_ENV !== 'production') {
                                console.log('## 禁用 location.reload()');
                            }
                        };
                    case 'replace':
                        return () => {
                            if (process.env.NODE_ENV !== 'production') {
                                console.log('## 禁用 location.replace()');
                            }
                        };
                    case 'toString':
                        return () => {
                            try {
                                return location.toString();
                            }
                            catch (e) {
                                return location.href;
                            }
                        };
                    default:
                        break;
                }
                if (typeof location[name] === 'function') {
                    // @ts-ignore
                    return location[name].bind && location[name].bind(target);
                }
                return location[name];
            },
        };
        // @ts-ignore
        this.instance = new ObjectProxy(location, proxyHandler);
    }
}
export default VmLocation;
