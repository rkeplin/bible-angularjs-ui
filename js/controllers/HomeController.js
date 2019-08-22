(function() {
    'use strict';

    angular.module('app.core')
        .controller('HomeController', HomeController);

    HomeController.$inject = ['$state', 'SearchStateService'];

    function HomeController ($state, SearchStateService) {
        var vm = this;
        vm.navIsOpen = false;
        vm.onToggleLeftNav = onToggleLeftNav;

        SearchStateService.onReady(onSearchResults);

        if ($state.$current.name === 'home') {
            $state.go('home.book', {
                'bookId': 1,
                'chapterId': 1
            }, {reload: true});
        }

        function onSearchResults () {
            if (window.innerWidth > 635) {
                return;
            }

            vm.navIsOpen = false;
        }

        function onToggleLeftNav() {
            vm.navIsOpen = !vm.navIsOpen;
        }
    }
})();
