(function() {
    'use strict';

    angular.module('app.core')
        .controller('SearchController', SearchController);

    SearchController.$inject = ['$scope', '$state', '$stateParams', 'ApiService', 'TranslationStateService', 'SearchStateService'];

    function SearchController ($scope, $state, $stateParams, ApiService, TranslationStateService, SearchStateService) {
        var vm = this;
        vm.query = $stateParams.query;
        vm.isLoading = true;
        vm.translation = TranslationStateService.getCurrent();
        vm.result = {
            total: 0,
            items: []
        };
        vm.loadMore = loadMore;

        var limit = 100,
            offset = 0;

        doSearch();

        TranslationStateService.onChange(doSearch);

        $scope.$on('$stateChangeStart', onStateChangeStart);

        function doSearch () {
            vm.translation = TranslationStateService.getCurrent();
            vm.isLoading = true;

            ApiService.search(vm.query, vm.translation, offset, limit).then(onSearch);
        }

        function loadMore () {
            vm.isLoading = true;

            offset = offset + limit;

            ApiService.search(vm.query, vm.translation, offset, limit).then(onLoadMore);
        }

        function onStateChangeStart () {
            TranslationStateService.clearOnChangeListeners();
        }

        function onSearch (result) {
            offset = 0;

            vm.result = result;
            vm.isLoading = false;

            SearchStateService.ready();
        }

        function onLoadMore (result) {
            vm.result.items = vm.result.items.concat(result.items);
            vm.isLoading = false;
        }
    }
})();
