import { SandboxOptions, VmIFrameElement } from './types';
import VmWindow from './VmWindow';
import VmDocument from './VmDocument';
import VmLocation from './VmLocation';
import VmHistory from './VmHistory';
interface LoadScriptsOptions {
    /** 要加载的 url */
    url: string;
    /** 当前 vm 上下文*/
    vm: VmContext;
    /** 是否继承当前 vm，默认继承 */
    noNeedDeriveVm?: boolean;
    /** 若已经拿到了code,则直接执行 */
    code?: string;
    /** 是否需要sourceMap调试支持（组件开发调试时默认开启） */
    sourceMapSupport?: boolean;
}
declare class VmContext {
    /** 当前沙盒的 options */
    options?: SandboxOptions;
    /** 当前沙盒的 window */
    window?: VmWindow;
    /** 当前沙盒所属 iframe */
    baseFrame?: VmIFrameElement;
    /** 代理 document */
    document?: VmDocument;
    /** 代理 location */
    location?: VmLocation;
    /** 代理 history */
    history?: VmHistory;
    /** 代理 body */
    body?: HTMLElement;
    /** 事件监听池 */
    _listenerMap?: Map<string, any>;
    /**
     * 更新 body 元素
     * 沙箱内执行 document.body 时都会在当前 context.body 上执行
     */
    updateBody(dom: HTMLElement): void;
    /**
     * 移除
     */
    remove(): void;
    /** 获取继承的 vm */
    clone(): VmContext;
    /**
     * 工厂函数,创建一个沙盒环境
     */
    static create(options: SandboxOptions): Promise<VmContext>;
    /**
     * 动态加载脚本并在沙箱中执行
     */
    static loadScripts({ url, vm, noNeedDeriveVm, code, sourceMapSupport, }: LoadScriptsOptions): Promise<any>;
    /**
     * 在沙盒环境中执行代码
     */
    static evalScript(code: string, vm: VmContext, sourceUrl?: string, sourceMapSupport?: boolean): any;
    /** 销毁 context */
    static remove(context: VmContext): Promise<void>;
}
export default VmContext;
