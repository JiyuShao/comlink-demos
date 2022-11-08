/*
 * 沙箱环境工厂函数
 * @Author: lilonglong
 * @Date: 2022-01-20 22:06:38
 * @Last Modified by: lilonglong
 * @Last Modified time: 2022-03-16 16:57:03
 */
import './ElementInjector.js';
import VmContext from './VmContext.js';
/**
 * 创建沙箱环境
 */
export const createVmContext = async (conf) => {
    return VmContext.create(conf);
};
/**
 * 销毁沙箱环境
 */
export const removeVmContext = async (context) => {
    return VmContext.remove(context);
};
/**
 * 在沙箱中执行代码
 */
export const evalScript = (code, vm) => {
    return VmContext.evalScript(code, vm);
};
