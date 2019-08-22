(function() {
    'use strict';

    angular.module('app.core')
        .controller('SearchController', SearchController);

    SearchController.$inject = ['$scope', '$transitions', '$state', '$stateParams', 'ApiService', 'TranslationStateService', 'SearchStateService', 'TitleStateService'];

    function SearchController ($scope, $transitions, $state, $stateParams, ApiService, TranslationStateService, SearchStateService, TitleStateService) {
        var vm = this;
        vm.query = $stateParams.query;
        vm.isLoading = true;
        vm.result = {
            total: 0,
            items: []
        };
        vm.loadMore = loadMore;

        var translation = TranslationStateService.getCurrent(),
            limit = 100,
            offset = 0;

        doSearch();

        TranslationStateService.onChange('search', function (obj) {
            translation = obj.abbreviation;

            doSearch()
        });

        $transitions.onStart({}, onStartTransition);

        function onStartTransition () {
            TranslationStateService.onChange('search', null);
        }

        function doSearch () {
            TitleStateService.change('Searching...');

            vm.isLoading = true;

            ApiService.search(vm.query, translation, offset, limit).then(onSearch);
        }

        function loadMore () {
            vm.isLoading = true;

            offset = offset + limit;

            ApiService.search(vm.query, translation, offset, limit).then(onLoadMore);
        }

        function onSearch (result) {
            window.scrollTo(0, 0);

            offset = 0;

            vm.result = result;
            vm.isLoading = false;

            TitleStateService.change('<b>Found ' + vm.result.total + ' Results</b><span class="hide-xs"> - <i>In ' + translation + '</i></span>');
            SearchStateService.ready();
        }

        function onLoadMore (result) {
            vm.result.items = vm.result.items.concat(result.items);
            vm.isLoading = false;
        }
    }
})();
