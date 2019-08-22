(function() {
    'use strict';

    angular.module('app.core')
        .controller('HomeController', HomeController);

    HomeController.$inject = ['$state', 'SearchStateService', 'ModalStateService'];

    function HomeController ($state, SearchStateService, ModalStateService) {
        var vm = this;
        vm.navIsOpen = false;
        vm.onToggleLeftNav = onToggleLeftNav;

        SearchStateService.onReady(onSearchResults);
        ModalStateService.onOpen(onOpenCrossReferenceModal);

        if ($state.$current.name === 'home') {
            $state.go('home.book', {
                'bookId': 1,
                'chapterId': 1
            }, {reload: true});
        }

        function onOpenCrossReferenceModal () {
            vm.navIsOpen = false;
        }

        function onSearchResults () {
            vm.navIsOpen = false;
        }

        function onToggleLeftNav() {
            vm.navIsOpen = !vm.navIsOpen;
        }
    }
})();
