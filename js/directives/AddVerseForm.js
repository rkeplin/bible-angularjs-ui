(function() {
    'use strict';

    angular.module('app.core')
        .directive('addVerseForm', addVerseForm);

    function addVerseForm () {
        return {
            restrict: 'E',
            scope: {},
            controller: ctrl,
            controllerAs: 'vm',
            bindToController: true,
            templateUrl: '/js/views/directives/add-verse-form.html'
        };
    }

    ctrl.$inject = ['$scope', '$stateParams', 'AppService', 'ApiService', '$q', 'TranslationStateService', '$transitions'];

    function ctrl ($scope, $stateParams, AppService, ApiService, $q, TranslationStateService, $transitions) {
        var vm = this;
        vm.listId = $stateParams.listId;
        vm.error = false;
        vm.books = [];
        vm.selected = {
            book: { id: null },
            chapter: { id: null },
            verse: { id: null }
        };
        vm.isLoading = true;
        vm.save = save;
        vm.onSelectBook = onSelectBook;
        vm.onSelectChapter = onSelectChapter;

        getBooks();

        TranslationStateService.onChange('addVerseForm', onTranslationChange);

        $transitions.onStart({}, function () {
            TranslationStateService.unsubscribe('addVerseForm');
        });

        function save () {
            vm.error = false;

            if (!vm.selected.verse.realId) {
                return;
            }

            vm.isLoading = true;

            AppService.addVerseToList(vm.listId, vm.selected.verse.realId, TranslationStateService.getCurrent())
                .then(onSave)
                .catch(onError)
                .finally(stopLoading);
        }

        function onSave() {
            $scope.$emit('verse.added');
        }

        function onTranslationChange() {
            if (vm.selected.chapter.id == null) {
                return;
            }

            onSelectChapter(vm.selected.chapter);
        }

        function getBooks () {
            vm.isLoading = true;

            return ApiService.getBooks().then(function(books) {
                vm.books = books;
                vm.selected.book = vm.books[0];

                return vm.selected.book.id;
            }).then(ApiService.getChaptersFromBook).then(function(chapters) {
                vm.chapters = chapters;
                vm.selected.chapter = vm.chapters[0];

                onSelectChapter(chapters[0]);
            }).finally(function() {
                vm.isLoading = false;
            });
        }

        function onSelectBook (book) {
            vm.isLoading = true;

            ApiService.getChaptersFromBook(book.id)
                .then(function(chapters) {
                    vm.chapters = chapters;
                    vm.selected.chapter = vm.chapters[0];

                    onSelectChapter(chapters[0]);
                }).finally(function() {
                    vm.isLoading = false;
                });
        }

        function onSelectChapter (chapter) {
            vm.verses = [];

            ApiService.getText(vm.selected.book.id, chapter.id, TranslationStateService.getCurrent()).then(function(text) {
                for (var i = 0; i < text.length; i++) {
                    vm.verses.push(
                        {
                            realId: text[i].id,
                            id: text[i].verseId,
                            verse: text[i].verse
                        })
                    ;
                }

                vm.selected.verse = vm.verses[0];
            });
        }

        function onError(error) {
            vm.error = error.data;
        }

        function stopLoading() {
            vm.isLoading = false;
        }
    }
})();
