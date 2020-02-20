(function() {
    'use strict';

    angular.module('app.core')
        .controller('HomeController', HomeController);

    HomeController.$inject = ['$state', '$cookies', 'AppService', '$transitions', 'SearchStateService', 'ModalStateService', 'TitleStateService'];

    function HomeController ($state, $cookies, AppService, $transitions, SearchStateService, ModalStateService, TitleStateService) {
        var vm = this;
        vm.navIsOpen = false;
        vm.title = 'Loading...';
        vm.onToggleLeftNav = onToggleLeftNav;
        vm.loggedIn = $cookies.get('token');

        SearchStateService.onReady(onSearchResults);
        TitleStateService.onChange(onTitleChange);
        ModalStateService.onOpen(closeNavigation);

        $transitions.onSuccess({}, onSuccessTransition);

        if (!isMobile()) {
            vm.navIsOpen = true;
        }

        if ($state.$current.name === 'home') {
            $state.go('home.book', {
                'bookId': 1,
                'chapterId': 1
            }, {reload: true});
        }

        function onSuccessTransition (transition) {
            if (transition.to().name == 'home.book') {
                ModalStateService.onOpen(closeNavigation);
            }

            vm.loggedIn = $cookies.get('token');
        }

        function onTitleChange (value) {
            vm.title = value;
        }

        function onSearchResults () {
            if (!isMobile()) {
                return;
            }

            closeNavigation();
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

        function isMobile() {
            return (window.innerWidth <= 635);
        }

        function enableMobileScrolling () {
            if (!isMobile()) {
                return;
            }

            var elem = document.querySelector('body');
            elem.style.overflow = 'initial';
        }

        function disableMobileScrolling () {
            if (!isMobile()) {
                return;
            }

            var elem = document.querySelector('body');
            elem.style.overflow = 'hidden';
        }
    }
})();
