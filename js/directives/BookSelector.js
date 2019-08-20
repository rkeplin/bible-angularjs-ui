(function() {
    'use strict';

    angular.module('app.core')
        .directive('bookSelector', bookSelector);

    function bookSelector () {
        return {
            restrict: 'E',
            scope: {},
            controller: ctrl,
            controllerAs: 'vm',
            bindToController: true,
            templateUrl: '/js/views/directives/book-selector.html'
        };
    }

    ctrl.$inject = ['$scope', 'ApiService', '$q', '$state', '$stateParams', 'BookSelectorStateService'];

    function ctrl ($scope, ApiService, $q, $state, $stateParams, BookSelectorStateService) {
        var vm = this;
        vm.books = [];
        vm.selected = {
            book: { id: null },
            chapter: { id: null }
        };

        vm.disablePreviousBtn = false;
        vm.disableNextBtn = false;
        vm.isLoading = true;
        vm.onSelectBook = onSelectBook;
        vm.onSelectChapter = onSelectChapter;
        vm.onPreviousClick = onPreviousClick;
        vm.onNextClick = onNextClick;

        var stateBookId = parseInt($stateParams.bookId),
            stateChapterId = parseInt($stateParams.chapterId);

        if (!stateBookId) {
            stateBookId = 1;
        }

        if (!stateChapterId) {
            stateChapterId = 1;
        }

        checkBtnState(stateBookId, stateChapterId);

        getBooks();

        BookSelectorStateService.subscribe('next', function () {
            if (vm.disableNextBtn) {
                return false;
            }

            vm.onNextClick();
        });

        BookSelectorStateService.subscribe('previous', function () {
            if (vm.disablePreviousBtn) {
                return false;
            }

            vm.onPreviousClick();
        });

        function getBooks () {
            return ApiService.getBooks().then(function(books) {
                var tag = '(OT)';

                for (var i = 0; i < books.length; i++) {
                    if (i >= 39) {
                        tag = '(NT)';
                    }

                    books[i].name = books[i].name + ' ' + tag;
                }

                vm.books = books;
                setSelectedBook(stateBookId);

                return stateBookId;
            }).then(ApiService.getChaptersFromBook).then(function(chapters) {
                vm.chapters = chapters;
                setSelectedChapter(stateChapterId);
            }).finally(function() {
                vm.isLoading = false;
            });
        }

        function onSelectBook (book) {
            setSelectedChapter(1);

            ApiService.getChaptersFromBook(book.id)
                .then(function(chapters) {
                    vm.chapters = chapters;
                });

            checkBtnState(book.id, 1);

            $state.go('home.book', {
                'bookId': book.id,
                'chapterId': 1,
                'verseId': null
            });
        }

        function onSelectChapter (chapter) {
            checkBtnState(vm.selected.book.id, chapter.id);

            $state.go('home.book', {
                'bookId': vm.selected.book.id,
                'chapterId': chapter.id,
                'verseId': null
            });
        }

        function onPreviousClick () {
            var bookId = vm.selected.book.id,
                chapterId = vm.selected.chapter.id;

            if ((chapterId - 1) === 0) {
                bookId--;

                vm.isLoading = true;

                ApiService.getChaptersFromBook(bookId)
                    .then(function(chapters) {
                        vm.chapters = chapters;

                        vm.isLoading = false;

                        setSelectedBook(bookId);
                        setSelectedChapter(chapters.length);

                        checkBtnState(bookId, chapters.length);

                        $state.go('home.book', {
                            'bookId': bookId,
                            'chapterId': chapters.length,
                            'verseId': null
                        });
                    });
            } else {
                chapterId--;
                setSelectedChapter(chapterId);

                checkBtnState(bookId, chapterId);

                $state.go('home.book', {
                    'bookId': bookId,
                    'chapterId': chapterId,
                    'verseId': null
                });
            }
        }

        function onNextClick () {
            var maxChapters = vm.chapters.length,
                bookId = vm.selected.book.id,
                chapterId = vm.selected.chapter.id;

            if ((chapterId + 1) > maxChapters) {
                bookId++;
                chapterId = 1;

                $scope.isLoading = true;

                ApiService.getChaptersFromBook(bookId)
                    .then(function(chapters) {
                        vm.chapters = chapters;

                        $scope.isLoading = false;
                    });

            } else {
                chapterId++;
            }

            setSelectedBook(bookId);
            setSelectedChapter(chapterId);

            checkBtnState(bookId, chapterId);

            $state.go('home.book', {
                'bookId': bookId,
                'chapterId': chapterId,
                'verseId': null
            });
        }

        function setSelectedBook (bookId) {
            for (var index in vm.books) {
                if (vm.books[index].id === bookId) {
                    vm.selected.book = vm.books[index];
                    break;
                }
            }

            if (vm.selected.book.id == null) {
                vm.selected.book = vm.books[0];
            }
        }

        function setSelectedChapter (chapterId) {
            for (var index in vm.chapters) {
                if (vm.chapters[index].id === chapterId) {
                    vm.selected.chapter = vm.chapters[index];
                    break;
                }
            }

            if (vm.selected.chapter.id == null) {
                vm.selected.chapter = vm.chapters[0];
            }
        }

        function checkBtnState (bookId, chapterId) {
            vm.disablePreviousBtn = (bookId === 1) && (chapterId === 1);

            vm.disableNextBtn = (bookId === 66) && (chapterId === 22);
        }
    }
})();
