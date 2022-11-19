/*
 * 工具函数
 * @Author: lilonglong
 * @Date: 2022-01-20 22:06:38
 * @Last Modified by: lilonglong
 * @Last Modified time: 2022-01-27 10:05:07
 */
// is bind function
function isBoundFunction(target) {
    return (typeof target === 'function' &&
        target.name.indexOf('bound ') === 0 &&
        // eslint-disable-next-line no-prototype-builtins
        !target.hasOwnProperty('prototype'));
}
/**
 * 判断是否是 已bind 的函数
 */
export function isBoundedFunction(value) {
    if (typeof value.__MICRO_APP_ISBOUND_FUNCTION === 'boolean') {
        return value.__MICRO_APP_ISBOUND_FUNCTION;
    }
    // eslint-disable-next-line no-return-assign
    return (value.__MICRO_APP_ISBOUND_FUNCTION = isBoundFunction(value));
}
/**
 * 判断是否是 构造函数
 * 参考自: https://github.com/micro-zoe/micro-app/blob/dev/src/sandbox/bind_function.ts
 */
export function isConstructor(value) {
    if (typeof value.__MICRO_APP_ISCONSTRUCTOR === 'boolean') {
        return value.__MICRO_APP_ISCONSTRUCTOR;
    }
    const valueStr = value.toString();
    const result = (value.prototype?.constructor === value &&
        Object.getOwnPropertyNames(value.prototype).length > 1) ||
        /^function\s+[A-Z]/.test(valueStr) ||
        /^class\s+/.test(valueStr);
    // eslint-disable-next-line no-return-assign
    return (value.__MICRO_APP_ISCONSTRUCTOR = result);
}
