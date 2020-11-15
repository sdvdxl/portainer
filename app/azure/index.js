import angular from 'angular';

import config from './config';

import componentsModule from './components';
import restModule from './rest';
import servicesModule from './services';

angular.module('portainer.azure', [componentsModule, restModule, servicesModule]).config(config);
