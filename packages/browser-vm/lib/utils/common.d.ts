/**
 * 判断是否是 已bind 的函数
 */
export declare function isBoundedFunction(value: CallableFunction & {
    __MICRO_APP_ISBOUND_FUNCTION: boolean;
}): boolean;
/**
 * 判断是否是 构造函数
 * 参考自: https://github.com/micro-zoe/micro-app/blob/dev/src/sandbox/bind_function.ts
 */
export declare function isConstructor(value: FunctionConstructor & {
    __MICRO_APP_ISCONSTRUCTOR: boolean;
}): boolean;
