import { SandboxOptions } from '../types';
/**
 * 拦截对 localStorage 的访问
 * @param options
 * @returns
 */
export declare function getNamespacedKey(key: string, options: SandboxOptions): string;
export declare function getLocalStorageOverride(options: SandboxOptions): {
    getItem(key: string): string | null;
    setItem(key: string, value: any): void;
    removeItem(key: string): void;
    clear(): void;
    key(index: number): string | null;
};
