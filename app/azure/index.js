import angular from 'angular';

import config from './config';

import componentsModule from './components';
import restModule from './rest';

angular.module('portainer.azure', [componentsModule, restModule]).config(config);
