import BaseVm from './BaseVm';
import VmContext from './VmContext';
declare class VmLocation extends BaseVm<Location> {
    constructor(context: VmContext);
}
export default VmLocation;
