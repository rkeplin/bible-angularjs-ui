(function() {
    'use strict';

    angular.module('app.core')
        .controller('BookController', BookController);

        BookController.$inject = ['$scope', '$transitions', '$state', '$stateParams', 'ApiService', 'ModalStateService', 'TranslationStateService', 'BookSelectorStateService', 'TitleStateService'];

        function BookController ($scope, $transitions, $state, $stateParams, ApiService, ModalStateService, TranslationStateService, BookSelectorStateService, TitleStateService) {
            var vm = this;
            vm.book = {};
            vm.versesLeft = [];
            vm.versesRight = [];
            vm.open = open;

            var bookId = 1,
                chapterId = 1,
                verseId = null;

            if ($stateParams.hasOwnProperty('bookId')) {
                bookId = $stateParams.bookId;
            }

            if ($stateParams.hasOwnProperty('chapterId')) {
                chapterId = $stateParams.chapterId;
            }

            if ($stateParams.hasOwnProperty('verseId')) {
                verseId = $stateParams.verseId;
            }

            $transitions.onStart({}, onStartTransition);

            TranslationStateService.onChange('book', function() {
                init();
            });

            init();

            document.body.onkeydown = onKeyDownEvent;

            function init () {
                vm.book = {};

                ApiService.getText(bookId, chapterId, TranslationStateService.getCurrent())
                    .then(function(data) {
                        vm.versesLeft = [];
                        vm.versesRight = [];

                        vm.book = data[0].book;

                        var testament = (vm.book.testament == 'OT') ? 'Old Testament' : 'New Testament';

                        TitleStateService.change('<b>' + vm.book.name + '</b><span class="hide-xs"> - <i>' + testament + '</i></span>');

                        for (var i = 0; i < data.length; i++) {
                            if (verseId !== null) {
                                if (data[i].verseId == verseId) {
                                    data[i].highlight = true;
                                }
                            }

                            if (i < (data.length / 2)) {
                                vm.versesLeft.push(data[i]);

                                continue;
                            }

                            vm.versesRight.push(data[i]);
                        }
                    })
                    .then(function() {
                        if (verseId != null) {
                            setTimeout(function () {
                                var elem = document.getElementById('verse' + verseId);

                                elem.scrollIntoView();
                                window.scroll(window.scrollX, window.scrollY - 75);

                            }, 250);
                        }
                    });
            }

            function onStartTransition () {
                TranslationStateService.onChange('book', null);
            }

            function onKeyDownEvent (e) {
                if (e.keyCode === 27) {
                    ModalStateService.close();

                    $scope.$apply();
                }

                if (e.keyCode === 39) {
                    BookSelectorStateService.publish('next');
                }

                if (e.keyCode === 37) {
                    BookSelectorStateService.publish('previous');
                }
            }

            function open (placement, verse) {
                var element = document.getElementById('crossReferenceModal');

                element.style.left = null;
                element.style.left = null;

                if (placement === 'left') {
                    element.style.left = 0;
                } else {
                    element.style.right = 0;
                }

                var verses = vm.versesLeft.concat(vm.versesRight);

                for (var i = 0; i < verses.length; i++) {
                    if (verses[i].hasOwnProperty('highlight')) {
                        verses[i].highlight = false;

                        break;
                    }
                }

                ModalStateService.open(verse);
            }
        }
})();
