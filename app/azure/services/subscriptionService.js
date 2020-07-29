import angular from 'angular';
import { SubscriptionViewModel } from '../models/subscription';

angular.module('portainer.azure').factory('SubscriptionService', SubscriptionServiceFactory);

function SubscriptionServiceFactory(Subscription) {
  return {
    subscriptions,
    subscription,
  };

  async function subscriptions() {
    try {
      const results = await Subscription.query({}).$promise;
      return results.value.map((item) => new SubscriptionViewModel(item));
    } catch (err) {
      throw { msg: 'Unable to retrieve subscriptions', err };
    }
  }

  async function subscription(id) {
    const subscription = await Subscription.get({ id }).$promise;
    return new SubscriptionViewModel(subscription);
  }
}
