import controller from './azure-dashboard.controller.js';

angular.module('portainer.azure').component('azureDashboardView', {
  templateUrl: './azure-dashboard.html',
  controller,
});
