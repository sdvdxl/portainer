import angular from 'angular';

import { ContainerInstanceDetailsController } from './controller';

angular.module('portainer.azure').component('containerInstanceDetails', {
  templateUrl: './template.html',
  controller: ContainerInstanceDetailsController,
});
