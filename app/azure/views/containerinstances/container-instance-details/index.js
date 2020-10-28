import angular from 'angular';

import controller from './container-instance-details.controller';

angular.module('portainer.azure').component('containerInstanceDetails', {
  templateUrl: './container-instance-details.html',
  controller,
});
