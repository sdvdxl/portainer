import { ContainerInstancesViewController } from './controller.js';

angular.module('portainer.azure').component('containerInstancesView', {
  templateUrl: './template.html',
  controller: ContainerInstancesViewController,
});
