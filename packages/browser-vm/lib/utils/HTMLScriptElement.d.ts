import VmContext from '../VmContext';
export declare type InjectedHtmlElement = HTMLElement & {
    /** 当前元素所属的 vmContext */
    ownerVmContext: VmContext;
    /** 当前元素所属的 appId */
    appId: string;
};
export declare type InjectedHtmlScriptElement = HTMLScriptElement & InjectedHtmlElement & {
    /** 当前 script 标签所绑定的监听函数列表 */
    _listenerMap: Map<string, any>;
    /** 是否开启 在沙箱中执行script代码 */
    _evalScriptInSandbox: boolean;
    /** 当前 Script 标签被主动设置的 text */
    scriptText?: string;
};
/**
 * 为 script 标签注入拦截逻辑
 * @param el
 */
export declare const injectHTMLScriptElement: (el: InjectedHtmlScriptElement) => void;
