(function() {
    'use strict';

    angular.module('app.core')
        .controller('ListController', ListController);

    ListController.$inject = ['AppService', 'TitleStateService', '$state', '$scope'];

    function ListController (AppService, TitleStateService, $state, $scope) {
        var vm = this;
        vm.isLoading = false;
        vm.error = false;
        vm.toggleAddForm = false;
        vm.toggleUpdateForm = false;
        vm.toggleDeleteForm = false;
        vm.lists = [];
        vm.list = { name: '' };
        vm.add = add;
        vm.update = update;
        vm.remove = remove;
        vm.onKeyPress = onKeyPress;
        vm.showAddForm = showAddForm;
        vm.showUpdateForm = showUpdateForm;
        vm.showDeleteForm = showDeleteForm;

        TitleStateService.change('<b>Manage Lists</b>');

        window.scrollTo(0, 0);

        checkAuthorization().then(load);

        function showAddForm () {
            vm.toggleAddForm = !vm.toggleAddForm;
            vm.toggleUpdateForm = false;
            vm.toggleDeleteForm = false;
            vm.error = false;
            vm.list = { name: '' };
        }

        function showUpdateForm (list) {
            vm.toggleAddForm = false;
            vm.toggleUpdateForm = true;
            vm.toggleDeleteForm = false;
            vm.error = false;
            vm.list = angular.copy(list);
        }

        function showDeleteForm (list) {
            vm.toggleAddForm = false;
            vm.toggleUpdateForm = false;
            vm.toggleDeleteForm = true;
            vm.error = false;
            vm.list = angular.copy(list);
        }

        function add(list) {
            vm.error = false;
            vm.isLoading = true;

            AppService.addList(list)
                .then(onSave)
                .then(function () {
                    window.scrollTo(0, 0);
                    vm.toggleAddForm = false;
                })
                .catch(onError)
                .finally(stopLoading)
        }

        function update(list) {
            vm.error = false;
            vm.isLoading = true;

            AppService.updateList(list.id, list)
                .then(onSave)
                .then(function () {
                    window.scrollTo(0, 0);
                    vm.toggleUpdateForm = false;
                })
                .catch(onError)
                .finally(stopLoading)
        }

        function remove(list) {
            vm.isLoading = true;

            AppService.removeList(list.id)
                .then(function () {
                    window.scrollTo(0, 0);
                    vm.toggleDeleteForm = false;
                    vm.error = false;
                })
                .then(load)
                .finally(stopLoading)
        }

        function load () {
            AppService.list()
                .then(function(data) {
                    for (var i = 0; i < data.length; i++) {
                        data[i].dateAdded = new Date(data[i].dateAdded);
                        data[i].dateUpdated = new Date(data[i].dateUpdated);
                    }

                    vm.lists = data;
                });
        }

        function stopLoading() {
            vm.isLoading = false;
        }

        function onSave () {
            load();

            vm.list = { name: '' };
            vm.error = false;
        }

        function onError (error) {
            vm.error = error.data;
        }

        function onKeyPress (event) {
            var keyCode = event.which || event.keyCode;

            if (keyCode === 13) {
                if (vm.toggleAddForm) {
                    add(vm.list);
                }

                if (vm.toggleUpdateForm) {
                    update(vm.list);
                }
            }
        }

        function checkAuthorization() {
            return AppService.me()
                .catch(function () {
                    $state.go('home.login');
                });
        }
    }
})();
