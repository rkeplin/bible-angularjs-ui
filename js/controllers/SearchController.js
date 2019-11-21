(function() {
    'use strict';

    angular.module('app.core')
        .controller('SearchController', SearchController);

    SearchController.$inject = ['$scope', '$transitions', '$state', '$stateParams', 'ApiService', 'TranslationStateService', 'SearchStateService', 'TitleStateService', '$filter'];

    function SearchController ($scope, $transitions, $state, $stateParams, ApiService, TranslationStateService, SearchStateService, TitleStateService, $filter) {
        var vm = this;
        vm.query = $stateParams.query;
        vm.isLoading = true;
        vm.isLoadingCounts = true;
        vm.otHits = 0;
        vm.ntHits = 0;
        vm.result = {
            total: 0,
            items: []
        };
        vm.loadMore = loadMore;

        var translation = TranslationStateService.getCurrent(),
            limit = 100,
            offset = 0,
            chart = null;

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
            vm.isLoadingCounts = true;

            ApiService.search(vm.query, translation, offset, limit).then(onSearch);
            ApiService.searchAggregation(vm.query, translation).then(onSearchAggregation);
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

            var append = '';

            if (vm.result.total === 10000) {
                append = '+';
            }

            TitleStateService.change('<b>Found ' + $filter('number')(vm.result.total) + append + ' Results</b><span class="hide-xs"> - <i>In ' + translation + '</i></span>');
            SearchStateService.ready();
        }

        function onSearchAggregation (result) {
            if (chart == null) {
                initChart();
            }

            vm.otHits = 0;
            vm.ntHits = 0;

            for (var i = 0; i < result.length; i++) {
                if (i >= 39) {
                    vm.ntHits += result[i].hits;
                } else {
                    vm.otHits += result[i].hits;
                }

                chart.data.labels[i] = result[i].book.name;
                chart.data.datasets[0].data[i] = result[i].hits;
            }

            vm.isLoadingCounts = false;

            setTimeout(function() {
                chart.update();
            }, 250);
        }

        function onLoadMore (result) {
            vm.result.items = vm.result.items.concat(result.items);
            vm.isLoading = false;
        }

        function initChart () {
            var ctx = document.getElementById('graph'),
                labels = [],
                data = [],
                backgroundColors = [],
                borderColors = [],
                bg = 'rgba(81, 81, 81, 0.2)',
                border = 'rgba(81, 81, 81, 0.5)';

            for (var i = 0; i <= 66; i++) {
                if (i >= 39) {
                    bg = 'rgba(152, 140, 81, 0.5)';
                    border = 'rgba(152, 140, 81, 1)';
                }

                backgroundColors[i] = bg;
                borderColors[i] = border;
            }

            chart = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: labels,
                    datasets: [{
                        label: 'Instances Found',
                        data: data,
                        backgroundColor: backgroundColors,
                        borderColor: borderColors,
                        borderWidth: 1,
                        minBarLength: 5
                    }]
                },
                options: {
                    maintainAspectRatio: false,
                    legend: {
                        display: false
                    },
                    tooltips: {
                        displayColors: false,
                        xPadding: 15,
                        yPadding: 15,
                        backgroundColor: 'rgba(108, 117, 125, 1)',
                        callbacks: {
                            title: function (tooltipItem) {
                                console.log(tooltipItem);

                                var testament = (tooltipItem[0].index < 39) ? 'Old Testament' : 'New Testament';

                                return tooltipItem[0].label + ' - ' + testament;
                            },
                            label: function(tooltipItem) {
                                return $filter('number')(tooltipItem.yLabel) + ' Results';
                            }
                        }
                    },
                    scales: {
                        xAxes: [{
                            gridLines: {
                                display: false
                            },
                            ticks: {
                                display: false
                            }
                        }],
                        yAxes: [{
                            ticks: {
                                beginAtZero: true
                            }
                        }]
                    }
                }
            });
        }
    }
})();
