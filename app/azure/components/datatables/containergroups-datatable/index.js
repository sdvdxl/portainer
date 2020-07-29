import angular from 'angular';

angular.module('portainer.azure').component('containergroupsDatatable', {
  templateUrl: './template.html',
  controller: 'GenericDatatableController',
  bindings: {
    title: '@',
    titleIcon: '@',
    dataset: '<',
    tableKey: '@',
    orderBy: '@',
    reverseOrder: '<',
    removeAction: '<',
  },
});
