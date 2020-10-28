import angular from 'angular';

import controller from './create-container-instance-view.controller';

angular.module('portainer.azure').component('createContainerInstanceView', {
  templateUrl: './create-container-instance-view.html',
  controller,
});
