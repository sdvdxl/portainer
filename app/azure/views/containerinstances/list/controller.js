import _ from 'lodash-es';

export class ContainerInstancesViewController {
  constructor($async, $state, AzureService, Notifications) {
    Object.assign(this, { $async, $state, AzureService, Notifications });

    this.containerGroups = [];

    this.deleteActionAsync = this.deleteActionAsync.bind(this);
    this.deleteAction = this.deleteAction.bind(this);
    this.$onInit = this.$onInit.bind(this);
  }

  deleteAction(selectedItems) {
    return this.$async(this.deleteActionAsync, selectedItems);
  }
  async deleteActionAsync(selectedItems) {
    for (let item of selectedItems) {
      try {
        await this.AzureService.deleteContainerGroup(item.Id);
        this.Notifications.success('Container group successfully removed', item.Name);

        _.remove(this.containerGroups, item);
      } catch (err) {
        this.Notifications.error('Failure', err, 'Unable to remove container group');
      }
    }
  }

  async $onInit() {
    try {
      const subscriptions = await this.AzureService.subscriptions();
      const containerGroups = await this.AzureService.containerGroups(subscriptions);
      this.containerGroups = this.AzureService.aggregate(containerGroups);
    } catch (err) {
      this.Notifications.error('Failure', err, 'Unable to load container groups');
    }
  }
}
