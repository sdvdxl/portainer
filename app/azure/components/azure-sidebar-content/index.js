import angular from 'angular';

angular.module('portainer.azure').component('azureSidebarContent', {
  templateUrl: './azure-sidebar-content.html',
  bindings: {
    endpointId: '<',
  },
});
