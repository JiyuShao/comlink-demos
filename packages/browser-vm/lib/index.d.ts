import './ElementInjector';
import { SandboxOptions } from './types';
import VmContext from './VmContext';
/**
 * 创建沙箱环境
 */
export declare const createVmContext: (conf: SandboxOptions) => Promise<VmContext>;
/**
 * 销毁沙箱环境
 */
export declare const removeVmContext: (context: VmContext) => Promise<void>;
/**
 * 在沙箱中执行代码
 */
export declare const evalScript: (code: string, vm: VmContext) => any;
export { SandboxOptions } from './types';
