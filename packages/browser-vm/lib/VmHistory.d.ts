import BaseVm from './BaseVm';
import VmContext from './VmContext';
declare class VmHistory extends BaseVm<History> {
    constructor(context: VmContext);
}
export default VmHistory;
