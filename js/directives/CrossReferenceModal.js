(function() {
    'use strict';

    angular.module('app.core')
        .directive('crossReferenceModal', crossReferenceModal);

    function crossReferenceModal () {
        return {
            restrict: 'E',
            scope: {},
            controller: ctrl,
            controllerAs: 'vm',
            bindToController: true,
            templateUrl: '/js/views/directives/cross-reference-modal.html'
        }
    }

    ctrl.$inject = ['$scope', 'ApiService', 'ModalStateService', 'TranslationStateService'];

    function ctrl ($scope, ApiService, ModalStateService, TranslationStateService) {
        var vm = this;
        vm.verse = {};
        vm.relatedVerses = [];
        vm.isOpen = false;
        vm.close = close;

        var currentVerse = null;

        TranslationStateService.onChange(function () {
            if (!vm.isOpen) {
                return false;
            }

            init();
        });

        ModalStateService.onOpen(function(verse) {
            window.scroll(0, 0);

            if (currentVerse !== null) {
                currentVerse.highlight = false;
            }

            currentVerse = verse;
            currentVerse.highlight = true;

            vm.isOpen = true;
            vm.isLoading = true;

            init();
        });

        ModalStateService.onClose(function() {
            vm.isOpen = false;
        });

        function init () {
            ApiService.getCrossReferences(currentVerse.id, TranslationStateService.getCurrent())
                .then(function(data) {
                    vm.relatedVerses = data;
                    vm.isLoading = false;
                });
        }

        function close () {
            vm.isOpen = false;
        }
    }
})();
