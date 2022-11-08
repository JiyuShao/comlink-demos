import { InjectedHtmlScriptElement } from './HTMLScriptElement';
/**
 * 根据 src 获取 jsonp callbackname
 */
export declare const getJsonCallbackName: (src: string) => string | null;
/**
 * 沙箱环境 jsonp 处理
 * @param {InjectedHtmlScriptElement} scriptEl
 */
declare const injectScriptCallback: (scriptEl: InjectedHtmlScriptElement) => void;
export default injectScriptCallback;
