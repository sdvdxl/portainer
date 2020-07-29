export class ContainerInstancesViewController {
  constructor($state, AzureService, Notifications) {
    Object.assign(this, { $state, AzureService, Notifications });
    this.deleteAction = this.deleteAction.bind(this);
    this.$onInit = this.$onInit.bind(this);
  }

  $onInit() {
    this.AzureService.subscriptions()
      .then((data) => {
        var subscriptions = data;
        return this.AzureService.containerGroups(subscriptions);
      })
      .then((data) => {
        this.containerGroups = this.AzureService.aggregate(data);
      })
      .catch((err) => {
        this.Notifications.error('Failure', err, 'Unable to load container groups');
      });
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
}
