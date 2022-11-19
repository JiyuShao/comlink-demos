/*
 * 对一些全局变量做拦截操作
 * @Author: lilonglong
 * @Date: 2022-01-20 22:06:38
 * @Last Modified by: lilonglong
 * @Last Modified time: 2022-01-27 10:05:24
 */
/**
 * 拦截对 localStorage 的访问
 * @param options
 * @returns
 */
export function getNamespacedKey(key, options) {
    return options.appId ? `${options.appId}:${key}` : key;
}
export function getLocalStorageOverride(options) {
    const storageMap = new Map();
    return {
        getItem(key) {
            return window.localStorage.getItem(getNamespacedKey(key, options));
        },
        setItem(key, value) {
            const namespacedKey = getNamespacedKey(key, options);
            storageMap.set(namespacedKey, value);
            window.localStorage.setItem(namespacedKey, value);
        },
        removeItem(key) {
            const namespacedKey = getNamespacedKey(key, options);
            storageMap.delete(namespacedKey);
            window.localStorage.removeItem(namespacedKey);
        },
        clear() {
            storageMap.forEach((_val, key) => {
                window.localStorage.removeItem(key);
            });
            storageMap.clear();
        },
        key(index) {
            return window.localStorage.key(index);
        },
    };
}
