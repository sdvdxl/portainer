export class ContainerInstancesViewController {
  constructor($state, AzureService, Notifications) {
    Object.assign(this, { $state, AzureService, Notifications });
    this.deleteAction = this.deleteAction.bind(this);
    this.$onInit = this.$onInit.bind(this);
  }

  deleteAction(selectedItems) {
    var actionCount = selectedItems.length;
    angular.forEach(selectedItems, function (item) {
      this.AzureService.deleteContainerGroup(item.Id)
        .then(() => {
          this.Notifications.success('Container group successfully removed', item.Name);
          var index = this.containerGroups.indexOf(item);
          this.containerGroups.splice(index, 1);
        })
        .catch((err) => {
          this.Notifications.error('Failure', err, 'Unable to remove container group');
        })
        .finally(function final() {
          --actionCount;
          if (actionCount === 0) {
            this.$state.reload();
          }
        });
    });
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
