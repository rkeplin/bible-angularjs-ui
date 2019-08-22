'use strict';

angular.module('app.core', []);

angular.module('app', ['ngRoute', 'ui.router', 'ngSanitize', 'ngCookies', 'app.core'])
    .config(['$stateProvider', '$httpProvider', '$locationProvider',
        function($stateProvider, $httpProvider, $locationProvider) {
            $stateProvider.
                state('home', {
                    url: '/',
                    templateUrl: '/js/views/controllers/home.html',
                    controller: 'HomeController',
                    controllerAs: 'vm'
                }).
                state('home.book', {
                    url: 'books/:bookId/:chapterId?verseId',
                    templateUrl: '/js/views/controllers/book.html',
                    controller: 'BookController',
                    controllerAs: 'vm'
                }).
                state('home.search', {
                    url: 'search/?query',
                    templateUrl: '/js/views/controllers/search.html',
                    controller: 'SearchController',
                    controllerAs: 'vm'
                });

            $locationProvider.html5Mode(true);
        }
    ]);

var coreAppEnv = {};

if (window) {
    coreAppEnv = angular.extend(coreAppEnv, window.__coreAppEnv);
}

angular.module('app.core')
    .value('URL', coreAppEnv.URL)
    .value('API_URL', coreAppEnv.API_URL)
    .value('DEFAULT_TRANSLATION', coreAppEnv.DEFAULT_TRANSLATION);

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

(function() {
    'use strict';

    angular.module('app.core')
        .controller('HomeController', HomeController);

    HomeController.$inject = ['$state', '$transitions', 'SearchStateService', 'ModalStateService', 'TitleStateService'];

    function HomeController ($state, $transitions, SearchStateService, ModalStateService, TitleStateService) {
        var vm = this;
        vm.navIsOpen = false;
        vm.title = 'Loading...';
        vm.onToggleLeftNav = onToggleLeftNav;

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

    ctrl.$inject = ['$scope', '$transitions', 'ApiService', 'ModalStateService', 'TranslationStateService'];

    function ctrl ($scope, $transitions, ApiService, ModalStateService, TranslationStateService) {
        var vm = this;
        vm.verse = {};
        vm.relatedVerses = [];
        vm.isOpen = false;
        vm.close = close;

        var currentVerse = null;

        TranslationStateService.onChange('crossRef', function () {
            if (!vm.isOpen) {
                return false;
            }

            init();
        });

        $transitions.onStart({}, onStartTransition);

        ModalStateService.onOpen(function(verse) {
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

                    document.getElementById('crossReferenceModal').scrollTop = 0;
                });
        }

        function onStartTransition () {
            TranslationStateService.onChange('crossRef', null);
            ModalStateService.clear();
        }

        function close () {
            vm.isOpen = false;
        }
    }
})();

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
                        translations[i].name = translations[i].abbreviation;

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

(function() {
    'use strict';

    angular.module('app.core')
        .service('ApiService', ApiService);

    ApiService.$inject = ['$http', 'API_URL', '$q'];

    function ApiService($http, API_URL, $q) {
        return {
            getTranslations: getTranslations,
            getCrossReferences: getCrossReferences,
            getBooks: getBooks,
            getChaptersFromBook: getChaptersFromBook,
            getMaxChapterFromBook: getMaxChapterFromBook,
            getText: getText,
            search: search
        };

        function getTranslations () {
            return _get('/translations');
        }

        function getCrossReferences (verseId, translation) {
            return _get('/verse/' + verseId + '/relations', {
                params: {
                    translation: translation
                }
            });
        }

        function getBooks () {
            return _get('/books');
        }

        function getChaptersFromBook (bookId) {
            return _get('/books/' + bookId + '/chapters');
        }

        function getMaxChapterFromBook (bookId) {
            var deferred = $q.defer();

            _get('/books/' + bookId + '/chapters')
                .then(function(data) {
                    deferred.resolve(data[data.length - 1].id);
                }).catch(function() {
                    deferred.reject();
                });

            return deferred.promise;
        }

        function getText (bookId, chapterId, translation) {
            return _get('/books/' + bookId + '/chapters/' + chapterId, {
                params: {
                    translation: translation
                }
            });
        }

        function search (query, translation, offset, limit) {
            return _get('/search', {
                params: {
                    query: query,
                    translation: translation,
                    offset: offset,
                    limit: limit
                }
            });
        }

        function _getHttpOptions (endpoint, options) {
            var defaultOptions = {},
                httpOptions = {};

            if (typeof options === 'object') {
                httpOptions = angular.extend(options, defaultOptions)
            } else {
                httpOptions = defaultOptions;
            }

            return httpOptions;
        }

        function _get (endpoint, options) {
            var url = API_URL + endpoint,
                httpOptions = _getHttpOptions(endpoint, options);

            return $http.get(url, httpOptions).then(function(response) {
                return response.data;
            })
        }
    }
})();

(function() {
    'use strict';

    angular.module('app.core')
        .service('BookSelectorStateService', BookSelectorStateService);

    function BookSelectorStateService () {
        var subscriptions = [];

        return {
            subscribe: subscribe,
            unsubscribe: unsubscribe,
            publish: publish
        };

        function subscribe (topic, fn) {
            subscriptions[topic] = fn;
        }

        function unsubscribe (topic) {
            delete subscriptions[topic];
        }

        function publish (topic) {
            subscriptions[topic]();
        }
    }
})();

(function() {
    'use strict';

    angular.module('app.core')
        .service('ModalStateService', ModalStateService);

    function ModalStateService () {
        var openFns = [],
            closeFn = null;

        return {
            open: open,
            onOpen: onOpen,
            close: close,
            onClose: onClose,
            clear: clear
        };

        function clear () {
            openFns = [];
        }

        function open (verseId) {
            if (openFns.length === 0) {
                return false;
            }

            for (var i = 0; i < openFns.length; i++) {
                openFns[i](verseId);
            }
        }

        function close () {
            if (closeFn == null) {
                return false;
            }

            closeFn();
        }

        function onOpen(callback) {
            openFns.push(callback);
        }

        function onClose(callback) {
            closeFn = callback;
        }
    }
})();

(function() {
    'use strict';

    angular.module('app.core')
        .service('SearchStateService', SearchStateService);

    function SearchStateService () {
        var subscriptionFns = [];

        return {
            onReady: onReady,
            unsubscribe: unsubscribe,
            ready: ready
        };

        function onReady (fn) {
            subscriptionFns.push(fn);
        }

        function unsubscribe () {
            subscriptionFns = [];
        }

        function ready () {
            if (subscriptionFns.length === 0) {
                return;
            }

            for (var i = 0; i < subscriptionFns.length; i++) {
                subscriptionFns[i]();
            }
        }
    }
})();

(function() {
    'use strict';

    angular.module('app.core')
        .service('TitleStateService', TitleStateService);

    function TitleStateService () {
        var changeFn = null;

        return {
            change: change,
            onChange: onChange
        };

        function change (value) {
            if (changeFn == null) {
                return false;
            }

            changeFn(value);
        }

        function onChange(callback) {
            changeFn = callback;
        }
    }
})();

(function() {
    'use strict';

    angular.module('app.core')
        .service('TranslationStateService', ['$cookies', 'DEFAULT_TRANSLATION', TranslationStateService]);

    function TranslationStateService ($cookies, DEFAULT_TRANSLATION) {
        var changeFns = {};

        if (typeof $cookies.get('translation') === 'undefined') {
            $cookies.put('translation', DEFAULT_TRANSLATION);
        }

        return {
            change: change,
            onChange: onChange,
            getCurrent: getCurrent
        };

        function change (translation) {
            $cookies.put('translation', translation.abbreviation);

            for (var key in changeFns) {
                if (changeFns.hasOwnProperty(key) && changeFns[key] != null) {
                    changeFns[key](translation);
                }
            }
        }

        function onChange (key, callback) {
            changeFns[key] = callback;
        }

        function getCurrent () {
            return $cookies.get('translation');
        }
    }
})();
