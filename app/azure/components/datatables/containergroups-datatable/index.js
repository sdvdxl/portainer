import angular from 'angular';

angular.module('portainer.azure').component('containergroupsDatatable', {
  templateUrl: './containergroups-datatable.html',
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
