import VmContext from './VmContext';
/**
 * window.addEventListener(type ... )
 * 下面的事件类型 将会绑定在 全局 window 上
 */
export declare const domEventsListeningTo: string[];
export declare const addEventListener: (context: VmContext) => (type: string, listener: any, options: AddEventListenerOptions) => void;
export declare const removeEventListener: (context: VmContext) => (type: string, listener: any, options: AddEventListenerOptions) => void;
