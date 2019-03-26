(function() {
    'use strict';

    angular.module('app.core')
        .directive('translationSelector', translationSelector);

    function translationSelector () {
        return {
            restrict: 'E',
            scope: {},
            controller: ctrl,
            controllerAs: 'vm',
            bindToController: true,
            templateUrl: '/js/views/directives/translation-selector.html'
        }
    }

    ctrl.$inject = ['$scope', 'ApiService', '$q', 'TranslationStateService'];

    function ctrl ($scope, ApiService, $q, TranslationStateService) {
        var vm = this;
        vm.translations = [];
        vm.selected = { translation: null };
        vm.isLoading = true;
        vm.onSelectTranslation = onSelectTranslation;

        getTranslations();

        function getTranslations() {
            return ApiService.getTranslations()
                .then(function(translations) {
                    for (var i = 0; i < translations.length; i++) {
                        translations[i].name = translations[i].abbreviation + ' - ' + translations[i].version;

                        if (TranslationStateService.getCurrent() == translations[i].abbreviation) {
                            vm.selected.translation = translations[i];
                        }
                    }

                    vm.translations = translations;
                    vm.isLoading = false;
                });
        }

        function onSelectTranslation (translation) {
            TranslationStateService.change(translation);
        }
    }
})();
