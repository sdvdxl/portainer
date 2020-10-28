import { ContainerGroupDefaultModel } from '../../../models/container_group';

export default class CreateContainerInstanceViewController {
  constructor($async, $q, $state, AzureService, Notifications) {
    Object.assign(this, { $async, $q, $state, AzureService, Notifications });
    this.allResourceGroups = [];
    this.allProviders = [];

    this.state = {
      actionInProgress: false,
      selectedSubscription: null,
      selectedResourceGroup: null,
    };

    this.changeSubscription = this.changeSubscription.bind(this);
    this.addPortBinding = this.addPortBinding.bind(this);
    this.removePortBinding = this.removePortBinding.bind(this);
    this.create = this.create.bind(this);
    this.createAsync = this.createAsync.bind(this);
    this.updateResourceGroupsAndLocations = this.updateResourceGroupsAndLocations.bind(this);
  }

  changeSubscription() {
    const selectedSubscription = this.state.selectedSubscription;
    this.updateResourceGroupsAndLocations(selectedSubscription, this.allResourceGroups, this.allProviders);
  }

  addPortBinding() {
    this.model.Ports.push({ host: '', container: '', protocol: 'TCP' });
  }

  removePortBinding(index) {
    this.model.Ports.splice(index, 1);
  }

  create() {
    return this.$async(this.createAsync);
  }
  async createAsync() {
    const model = this.model;
    const subscriptionId = this.state.selectedSubscription.Id;
    const resourceGroupName = this.state.selectedResourceGroup.Name;

    this.state.actionInProgress = true;
    try {
      await this.AzureService.createContainerGroup(model, subscriptionId, resourceGroupName);
      this.Notifications.success('Container successfully created', model.Name);
      this.$state.go('azure.containerinstances');
    } catch (err) {
      this.Notifications.error('Failure', err, 'Unable to create container');
    }
    this.state.actionInProgress = false;
  }

  updateResourceGroupsAndLocations(subscription, resourceGroups, providers) {
    this.state.selectedResourceGroup = resourceGroups[subscription.Id][0];
    this.resourceGroups = resourceGroups[subscription.Id];

    const currentSubLocations = providers[subscription.Id].Locations;
    this.model.Location = currentSubLocations[0];
    this.locations = currentSubLocations;
  }

  async $onInit() {
    this.model = new ContainerGroupDefaultModel();

    try {
      const subscriptions = await this.AzureService.subscriptions();
      this.state.selectedSubscription = subscriptions[0];
      this.subscriptions = subscriptions;

      const [resourceGroups, containerInstancesProviders] = await Promise.all([
        this.AzureService.resourceGroups(subscriptions),
        this.AzureService.containerInstanceProvider(subscriptions),
      ]);

      this.allResourceGroups = resourceGroups;
      this.allProviders = containerInstancesProviders;
      const selectedSubscription = this.state.selectedSubscription;
      this.updateResourceGroupsAndLocations(selectedSubscription, resourceGroups, containerInstancesProviders);
    } catch (err) {
      this.Notifications.error('Failure', err, 'Unable to retrieve Azure resources');
    }
  }
}
