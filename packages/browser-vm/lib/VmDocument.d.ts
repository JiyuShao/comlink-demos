import BaseVm from './BaseVm';
import VmContext from './VmContext';
export interface VmDocumentInstance extends Document {
}
declare class VmDocument extends BaseVm<VmDocumentInstance> {
    /** vm document instance */
    instance: VmDocumentInstance | null;
    /** eventListeners */
    private eventListeners;
    constructor(context: VmContext);
    /**
     * 设置 document.currentScript 拦截器
     * 兼容 webpack 的 hmr publicPath 相关逻辑
     */
    setCurrentScriptInterceptor(currScript: {
        src: string;
    }): void;
    destory(): void;
}
export default VmDocument;
