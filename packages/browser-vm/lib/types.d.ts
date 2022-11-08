/** 要暴露给 vm 的全局变量 */
export declare type ExternalVarRecord = string /** 若为 string 类型，则表示暴露全局 window 上对应的变量给 vm */ | {
    /** key 为要暴露到 vm 全局的变量名 */
    key: string;
    /** value 为其值 */
    value: any;
};
export interface SandboxOptions {
    /** appId */
    appId: string;
    /** 用于 iframe 加载,为沙箱提供完全隔离的window, 最好提供一个同域的返回空数据的url */
    url?: string;
    /** 全局变量白名单 */
    externalsVars?: ExternalVarRecord[];
    /** script 资源白名单,在此名单的可以在全局环境执行 */
    allowScriptResources?: string[];
    /** 是否允许 script 标签沙箱逃逸 */
    enableScriptEscape?: boolean;
}
export interface VmIFrameElement extends HTMLIFrameElement {
    contentWindow: HTMLIFrameElement['contentWindow'] & Record<PropertyKey, any>;
    [x: string]: any;
}
