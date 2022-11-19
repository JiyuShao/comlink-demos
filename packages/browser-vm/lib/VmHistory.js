/*
 * 覆盖 iframe.contentWindow 上的 history 相关方法
 * 实现监听沙箱内路由变化
 * @Author: lilonglong
 * @Date: 2022-01-20 22:06:38
 * @Last Modified by: lilonglong
 * @Last Modified time: 2022-03-16 19:31:06
 */
import BaseVm from './BaseVm.js';
class VmHistory extends BaseVm {
    constructor(context) {
        super(context);
        const { baseFrame } = context;
        if (!baseFrame?.contentWindow) {
            throw new Error('no baseFrame');
        }
        const { contentWindow } = baseFrame;
        const appId = context.options?.appId;
        // 如果不提供id 则直接返回 frameWindow.history
        if (!appId) {
            // eslint-disable-next-line no-constructor-return
            this.instance = contentWindow.history;
            return;
        }
        // 用来通知沙箱内部的路由变化
        const postMessage = () => {
            contentWindow.postMessage({
                type: `${appId}:history-change`,
                data: JSON.parse(JSON.stringify(contentWindow.location)),
            }, '*');
        };
        const originalPushStatus = contentWindow.history.pushState;
        const originalReplaceStatus = contentWindow.history.replaceState;
        contentWindow.history.pushState = (...args) => {
            const returnValue = originalPushStatus.apply(contentWindow.history, [
                ...args,
            ]);
            postMessage();
            return returnValue;
        };
        contentWindow.history.replaceState = (...args) => {
            const returnValue = originalReplaceStatus.apply(contentWindow.history, [
                ...args,
            ]);
            postMessage();
            return returnValue;
        };
        this.instance = contentWindow.history;
    }
}
export default VmHistory;
