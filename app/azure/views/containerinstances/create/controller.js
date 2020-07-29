import { ContainerGroupDefaultModel } from '../../../models/container_group';

export function CreateContainerInstanceViewController($q, $state, AzureService, Notifications) {
  var allResourceGroups = [];
  var allProviders = [];

  this.state = {
    actionInProgress: false,
    selectedSubscription: null,
    selectedResourceGroup: null,
  };

  this.changeSubscription = changeSubscription;
  function changeSubscription() {
    var selectedSubscription = this.state.selectedSubscription;
    this.updateResourceGroupsAndLocations(selectedSubscription, allResourceGroups, allProviders);
  }

  this.addPortBinding = addPortBinding;
  function addPortBinding() {
    this.model.Ports.push({ host: '', container: '', protocol: 'TCP' });
  }

  this.removePortBinding = removePortBinding;
  function removePortBinding(index) {
    this.model.Ports.splice(index, 1);
  }

  this.create = create;
  function create() {
    var model = this.model;
    var subscriptionId = this.state.selectedSubscription.Id;
    var resourceGroupName = this.state.selectedResourceGroup.Name;

    this.state.actionInProgress = true;
    AzureService.createContainerGroup(model, subscriptionId, resourceGroupName)
      .then(() => {
        Notifications.success('Container successfully created', model.Name);
        $state.go('azure.containerinstances');
      })
      .catch((err) => {
        Notifications.error('Failure', err, 'Unable to create container');
      })
      .finally(function final() {
        this.state.actionInProgress = false;
      });
  }

  this.updateResourceGroupsAndLocations = updateResourceGroupsAndLocations;
  function updateResourceGroupsAndLocations(subscription, resourceGroups, providers) {
    this.state.selectedResourceGroup = resourceGroups[subscription.Id][0];
    this.resourceGroups = resourceGroups[subscription.Id];

    var currentSubLocations = providers[subscription.Id].Locations;
    this.model.Location = currentSubLocations[0];
    this.locations = currentSubLocations;
  }

  this.$onInit = $onInit;
  function $onInit() {
    var model = new ContainerGroupDefaultModel();

    AzureService.subscriptions()
      .then((data) => {
        var subscriptions = data;
        this.state.selectedSubscription = subscriptions[0];
        this.subscriptions = subscriptions;

        return $q.all({
          resourceGroups: AzureService.resourceGroups(subscriptions),
          containerInstancesProviders: AzureService.containerInstanceProvider(subscriptions),
        });
      })
      .then((data) => {
        var resourceGroups = data.resourceGroups;
        allResourceGroups = resourceGroups;

        var containerInstancesProviders = data.containerInstancesProviders;
        allProviders = containerInstancesProviders;

        this.model = model;

        var selectedSubscription = this.state.selectedSubscription;
        this.updateResourceGroupsAndLocations(selectedSubscription, resourceGroups, containerInstancesProviders);
      })
      .catch((err) => {
        Notifications.error('Failure', err, 'Unable to retrieve Azure resources');
      });
  }
}
