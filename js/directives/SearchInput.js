(function() {
    'use strict';

    angular.module('app.core')
        .directive('searchInput', searchInput);

    function searchInput () {
        return {
            restrict: 'E',
            scope: {},
            controller: ctrl,
            controllerAs: 'vm',
            bindToController: true,
            templateUrl: '/js/views/directives/search-input.html'
        };
    }

    ctrl.$inject = ['$transitions', '$state', '$stateParams', 'SearchStateService'];

    function ctrl ($transitions, $state, $stateParams, SearchStateService) {
        var vm = this;
        vm.searchQuery = '';
        vm.onSearch = onSearch;
        vm.onKeyPress = onKeyPress;
        vm.isLoading = false;

        if ($stateParams.query) {
            vm.searchQuery = $stateParams.query;
        }

        init();

        function init () {
            $transitions.onStart({}, onStartTransition);

            SearchStateService.onReady(onReady);
        }

        function onKeyPress (event) {
            var keyCode = event.which || event.keyCode;

            if (keyCode === 13) {
                onSearch(vm.searchQuery);
            }
        }

        function onStartTransition (transition) {
            vm.isLoading = true;

            if (transition.to().name !== 'home.search') {
                vm.isLoading = false;
            }
        }

        function onReady () {
            vm.isLoading = false;
        }

        function onSearch (searchQuery) {
            $state.go('home.search', {
                'query': searchQuery
            });
        }
    }
})();
