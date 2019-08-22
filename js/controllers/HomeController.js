(function() {
    'use strict';

    angular.module('app.core')
        .controller('HomeController', HomeController);

    HomeController.$inject = ['$state', 'SearchStateService', 'ModalStateService'];

    function HomeController ($state, SearchStateService, ModalStateService) {
        var vm = this;
        vm.navIsOpen = false;
        vm.onToggleLeftNav = onToggleLeftNav;

        SearchStateService.onReady(closeNavigation);
        ModalStateService.onOpen(closeNavigation);

        if ($state.$current.name === 'home') {
            $state.go('home.book', {
                'bookId': 1,
                'chapterId': 1
            }, {reload: true});
        }

        function closeNavigation () {
            vm.navIsOpen = false;

            enableMobileScrolling();
        }

        function onToggleLeftNav() {
            vm.navIsOpen = !vm.navIsOpen;

            if (vm.navIsOpen) {
                disableMobileScrolling();
            } else {
                enableMobileScrolling();
            }
        }

        function enableMobileScrolling () {
            if (window.innerWidth > 635) {
                return;
            }

            var elem = document.querySelector('body');
            elem.style.overflow = 'initial';
        }

        function disableMobileScrolling () {
            if (window.innerWidth > 635) {
                return;
            }

            var elem = document.querySelector('body');
            elem.style.overflow = 'hidden';
        }
    }
})();
