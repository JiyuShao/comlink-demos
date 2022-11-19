import BaseVm from './BaseVm';
import VmContext from './VmContext';
export declare type VmWindowInstance = HTMLIFrameElement['contentWindow'] & Record<PropertyKey, any>;
declare class VmWindow extends BaseVm<VmWindowInstance> {
    constructor(context: VmContext);
}
export default VmWindow;
