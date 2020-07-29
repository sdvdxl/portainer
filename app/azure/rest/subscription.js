import angular from 'angular';

angular.module('portainer.azure').factory('Subscription', SubscriptionFactory);

function SubscriptionFactory($resource, API_ENDPOINT_ENDPOINTS, EndpointProvider) {
  return $resource(
    `${API_ENDPOINT_ENDPOINTS}/:endpointId/azure/subscriptions/:id`,
    {
      endpointId: EndpointProvider.endpointID,
      'api-version': '2016-06-01',
    },
    {
      query: { method: 'GET' },
      get: { method: 'GET', params: { id: '@id' } },
    }
  );
}
