import angular from 'angular';

import config from './config';

import componentsModule from './components';

angular.module('portainer.azure', [componentsModule]).config(config);
