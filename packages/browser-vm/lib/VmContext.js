/* eslint-disable no-empty */
/*
 * 沙箱环境
 * @Author: lilonglong
 * @Date: 2022-01-20 22:06:38
 * @Last Modified by: lilonglong
 * @Last Modified time: 2022-07-15 09:55:58
 */
import VmWindow from './VmWindow.js';
import VmDocument from './VmDocument.js';
import VmLocation from './VmLocation.js';
import VmHistory from './VmHistory.js';
class VmContext {
    /** 当前沙盒的 options */
    options;
    /** 当前沙盒的 window */
    window;
    /** 当前沙盒所属 iframe */
    baseFrame;
    /** 代理 document */
    document;
    /** 代理 location */
    location;
    /** 代理 history */
    history;
    /** 代理 body */
    body;
    /** 事件监听池 */
    _listenerMap;
    /**
     * 更新 body 元素
     * 沙箱内执行 document.body 时都会在当前 context.body 上执行
     */
    updateBody(dom) {
        this.body = dom;
    }
    /**
     * 移除
     */
    remove() {
        this.window?.destroy();
        this.document?.destory();
        this.history?.destroy();
        this.location?.destroy();
        // 移除 context.baseFrae
        if (this.baseFrame) {
            if (this.baseFrame.parentNode) {
                this.baseFrame.parentNode.removeChild(this.baseFrame);
            }
            else {
                this.baseFrame.setAttribute('src', 'about:blank');
            }
        }
    }
    /** 获取继承的 vm */
    clone() {
        const vmDerived = new VmContext();
        vmDerived.options = this.options;
        vmDerived.baseFrame = this.baseFrame;
        vmDerived._listenerMap = new Map();
        vmDerived.window = this.window?.clone(vmDerived);
        vmDerived.location = this.location?.clone(vmDerived);
        vmDerived.document = this.document?.clone(vmDerived);
        /** history, body 不支持 clone */
        vmDerived.history = this.history;
        vmDerived.body = this.body;
        return vmDerived;
    }
    /**
     * 工厂函数,创建一个沙盒环境
     */
    static create(options) {
        return new Promise(resolve => {
            const iframe = document.createElement('iframe');
            /**
             * 只有同域的 iframe 才能取出对应的的 contentWindow。
             * 所以需要提供一个宿主应用空的同域 URL 来作为这个 iframe 初始加载的 URL。
             * 当然根据 HTML 的规范，这个 URL 用了 about:blank 一定保证同域，也不会发生资源加载，
             * 但是会发生和这个 iframe 中关联的 history 不能被操作，
             * 这个时候路由的变换只能变成 hash 模式。
             */
            iframe.setAttribute('src', options.url || 'about:blank');
            iframe.style.cssText =
                'position: absolute; top: -20000px; width: 100%; height: 1px;';
            document.body.appendChild(iframe);
            /** 初始化逻辑 */
            const init = () => {
                const vm = new this();
                vm.options = options;
                vm.baseFrame = iframe;
                vm._listenerMap = new Map();
                vm.window = new VmWindow(vm);
                vm.location = new VmLocation(vm);
                vm.history = new VmHistory(vm);
                vm.document = new VmDocument(vm);
                // body 暂时只用全局的 body
                vm.body = document.body;
                resolve(vm);
            };
            /** the onload will no trigger when src is about:blank */
            if (iframe.getAttribute('src') === 'about:blank') {
                init();
            }
            else {
                iframe.onload = () => {
                    init();
                };
            }
        });
    }
    /**
     * 动态加载脚本并在沙箱中执行
     */
    static async loadScripts({ url, vm, noNeedDeriveVm, code, sourceMapSupport, }) {
        let vmLocal;
        if (noNeedDeriveVm) {
            vmLocal = vm;
        }
        else {
            vmLocal = vm.clone();
        }
        /** 兼容 document.currentScript */
        vmLocal.document?.setCurrentScriptInterceptor({ src: url });
        let codeFetched;
        if (code) {
            codeFetched = code;
        }
        else {
            const resp = await fetch(url);
            codeFetched = await resp.text();
        }
        return VmContext.evalScript(codeFetched, vmLocal, url, sourceMapSupport);
    }
    /**
     * 在沙盒环境中执行代码
     */
    static evalScript(code, vm, sourceUrl = '', sourceMapSupport) {
        /** 特殊处理 sourceUrl */
        if (/^\/\//.test(sourceUrl)) {
            sourceUrl = `${window.location.protocol}${sourceUrl}`;
        }
        const sourceMapUrl = `${sourceUrl}.map`;
        /**
         * 利用 Function构造函数,构造沙箱环境,给 code 加一层 wrap,创建一个闭包,
         * 把需要隔离的浏览器原生对象变成从函数闭包中获取
         */
        // eslint-disable-next-line no-new-func
        const resolver = new Function(`
      return function(window) {
        with(window) {
          try {
            return (function() {
              "use strict";
              ${code}
            })();
          } catch(e) {
            console.log(e);
          }
        }
      }
      ${sourceMapSupport
            ? `//# sourceURL=${sourceUrl}
             //# sourceMappingURL=${sourceMapUrl}`
            : ''}
    `);
        return resolver().call(vm.window?.instance, vm.window?.instance);
    }
    /** 销毁 context */
    static async remove(context) {
        context.remove?.();
    }
}
export default VmContext;
