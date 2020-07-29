import angular from 'angular';
import { ContainerInstanceProviderViewModel } from '../models/provider';

angular.module('portainer.azure').factory('ProviderService', ProviderServiceFactory);

function ProviderServiceFactory(Provider) {
  return { containerInstanceProvider };

  async function containerInstanceProvider(subscriptionId) {
    try {
      const provider = await Provider.get({ subscriptionId, providerNamespace: 'Microsoft.ContainerInstance' }).$promise;
      return new ContainerInstanceProviderViewModel(provider);
    } catch (err) {
      throw { msg: 'Unable to retrieve provider', err: err };
    }
  }
}
