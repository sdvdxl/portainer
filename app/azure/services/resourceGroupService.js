import angular from 'angular';

import { ResourceGroupViewModel } from '../models/resource_group';

angular.module('portainer.azure').factory('ResourceGroupService', ResourceGroupServiceFactory);

function ResourceGroupServiceFactory(ResourceGroup) {
  return { resourceGroups, resourceGroup };

  async function resourceGroups(subscriptionId) {
    try {
      const results = await ResourceGroup.query({ subscriptionId }).$promise;
      return results.value.map((item) => new ResourceGroupViewModel(item, subscriptionId));
    } catch (err) {
      throw { msg: 'Unable to retrieve resource groups', err };
    }
  }

  async function resourceGroup(subscriptionId, resourceGroupName) {
    const group = await ResourceGroup.get({ subscriptionId, resourceGroupName }).$promise;
    return new ResourceGroupViewModel(group);
  }
}
