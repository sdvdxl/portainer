import angular from 'angular';

import { azureEndpointConfig } from './azure-endpoint-config';
import { azureSidebarContent } from './azure-sidebar-content';
import { containergroupsDatatable } from './datatables/containergroups-datatable';

export default angular
  .module('portainer.azure.components', [])
  .component('azureEndpointConfig', azureEndpointConfig)
  .component('azureSidebarContent', azureSidebarContent)
  .component('containergroupsDatatable', containergroupsDatatable).name;
