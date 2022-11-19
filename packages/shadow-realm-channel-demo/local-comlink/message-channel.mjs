// polyfill MessagePort and MessageChannel
export class MessagePortPolyfill {
    constructor() {
        this.onmessage = null;
        this.onmessageerror = null;
        this.otherPort = null;
        this.onmessageListeners = [];
    }
    dispatchEvent(event) {
        if (this.onmessage) {
            this.onmessage(event);
        }
        this.onmessageListeners.forEach(listener => listener(event));
        return true;
    }
    postMessage(message) {
        if (!this.otherPort) {
            return;
        }
        this.otherPort.dispatchEvent({ data: message });
    }

    on(type, listener) {
        if (type !== 'message') {
            return;
        }
        if (typeof listener !== 'function' ||
            this.onmessageListeners.indexOf(listener) !== -1) {
            return;
        }
        this.onmessageListeners.push(listener);
    }
    addEventListener(type, listener) {
        if (type !== 'message') {
            return;
        }
        if (typeof listener !== 'function' ||
            this.onmessageListeners.indexOf(listener) !== -1) {
            return;
        }
        this.onmessageListeners.push(listener);
    }
    off(type, listener) {
        if (type !== 'message') {
            return;
        }
        const index = this.onmessageListeners.indexOf(listener);
        if (index === -1) {
            return;
        }
        this.onmessageListeners.splice(index, 1);
    }
    removeEventListener(type, listener) {
        if (type !== 'message') {
            return;
        }
        const index = this.onmessageListeners.indexOf(listener);
        if (index === -1) {
            return;
        }
        this.onmessageListeners.splice(index, 1);
    }
    start() {
        // do nothing at this moment
    }
    close() {
        // do nothing at this moment
    }
}
export class MessageChannelPolyfill {
    constructor() {
        this.port1 = new MessagePortPolyfill();
        this.port2 = new MessagePortPolyfill();
        this.port1.otherPort = this.port2;
        this.port2.otherPort = this.port1;
    }
}
/**
 * https://github.com/zloirock/core-js/blob/master/packages/core-js/internals/global.js
 */;
export function applyPolyfill() {
    globalThis.MessagePort = MessagePortPolyfill;
    globalThis.MessageChannel = MessageChannelPolyfill;
}
if (!globalThis.MessagePort || !globalThis.MessageChannel) {
    applyPolyfill();
}
