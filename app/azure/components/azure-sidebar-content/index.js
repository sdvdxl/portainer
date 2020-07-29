import angular from 'angular';

angular.module('portainer.azure').component('azureSidebarContent', {
  templateUrl: './template.html',
  bindings: {
    endpointId: '<',
  },
});
