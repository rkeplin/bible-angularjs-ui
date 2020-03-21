(function() {
    'use strict';

    angular.module('app.core')
        .controller('ListVersesController', ListVersesController);

    ListVersesController.$inject = ['AppService', '$stateParams', 'TitleStateService', '$state', '$scope'];

    function ListVersesController (AppService, $stateParams, TitleStateService, $state, $scope) {
        var vm = this;
        vm.isLoading = false;
        vm.error = false;
        vm.listId = $stateParams.listId;
        vm.list = {
            name: ''
        };
        vm.verses = [];
        vm.verse = {};
        vm.toggleAddForm = false;
        vm.toggleDeleteForm = false;
        vm.showAddVerseForm = showAddVerseForm;
        vm.showDeleteForm = showDeleteForm;
        vm.remove = remove;

        TitleStateService.change('<b>Manage Lists</b><span class="hide-xs"> - <i>Add Verses</i></span>');

        window.scrollTo(0, 0);

        checkAuthorization().then(load);

        $scope.$on('verse.added', function() {
            load();
        });

        $scope.$on('add.cancel', function() {
            vm.toggleAddForm = false;
        });

        function showAddVerseForm () {
            vm.error = false;

            vm.toggleAddForm = !vm.toggleAddForm;
            vm.toggleDeleteForm = false;
        }

        function showDeleteForm (verse) {
            vm.error = false;
            verse.selected = true;

            vm.toggleAddForm = false;
            vm.toggleDeleteForm = true;
            vm.verse = angular.copy(verse);
        }

        function remove(verse) {
            vm.isLoading = true;

            AppService.removeVerseFromList(vm.listId, verse.text.id, verse.translation)
                .then(function() {
                    vm.verse = {};
                    vm.toggleDeleteForm = false;
                })
                .then(load)
                .finally(stopLoading)
        }

        function load () {
            return AppService.listById(vm.listId)
                .then(function(data) {
                    vm.list = data;

                    AppService.getVersesFromList(vm.listId)
                        .then(function(verses) {
                            vm.verses = verses;
                        });
                })
                .catch(function() {
                    $state.go('home.lists');
                });
        }

        function stopLoading() {
            vm.isLoading = false;
        }

        function checkAuthorization() {
            return AppService.me()
                .catch(function () {
                    $state.go('home.login');
                });


        }
    }
})();
