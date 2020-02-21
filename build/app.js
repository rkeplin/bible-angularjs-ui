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
                state('home.register', {
                    url: 'register',
                    templateUrl: '/js/views/controllers/register.html',
                    controller: 'RegisterController',
                    controllerAs: 'vm'
                }).
                state('home.login', {
                    url: 'login',
                    templateUrl: '/js/views/controllers/login.html',
                    controller: 'LoginController',
                    controllerAs: 'vm'
                }).
                state('home.logout', {
                    url: 'logout',
                    templateUrl: '/js/views/controllers/logout.html',
                    controller: 'LogoutController',
                    controllerAs: 'vm'
                }).
                state('home.list', {
                    url: 'list',
                    templateUrl: '/js/views/controllers/list.html',
                    controller: 'ListController',
                    controllerAs: 'vm'
                }).
                state('home.listVerses', {
                    url: 'list/:listId/verses',
                    templateUrl: '/js/views/controllers/list-verses.html',
                    controller: 'ListVersesController',
                    controllerAs: 'vm'
                }).
                state('home.book', {
                    url: 'books/:bookId/:chapterId?verseId',
                    templateUrl: '/js/views/controllers/book.html',
                    controller: 'BookController',
                    controllerAs: 'vm'
                }).
                state('home.bookWithTranslation', {
                    url: ':translation/books/:bookId/:chapterId?verseId',
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

            /* Turn on withCredentials - needed for CORS */
            // $httpProvider.interceptors.push([function() {
            //     return {
            //         request: function (config) {
            //             config.withCredentials = true;
            //             return config;
            //         }
            //     };
            // }]);
        }
    ]);

var coreAppEnv = {};

if (window) {
    coreAppEnv = angular.extend(coreAppEnv, window.__coreAppEnv);
}

angular.module('app.core')
    .value('URL', coreAppEnv.URL)
    .value('API_URL', coreAppEnv.API_URL)
    .value('APP_API_URL', coreAppEnv.APP_API_URL)
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

    HomeController.$inject = ['$state', '$cookies', 'AppService', '$transitions', 'SearchStateService', 'ModalStateService', 'TitleStateService'];

    function HomeController ($state, $cookies, AppService, $transitions, SearchStateService, ModalStateService, TitleStateService) {
        var vm = this;
        vm.navIsOpen = false;
        vm.title = 'Loading...';
        vm.onToggleLeftNav = onToggleLeftNav;
        vm.loggedIn = $cookies.get('token');

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

            vm.loggedIn = $cookies.get('token');
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
        .controller('ListController', ListController);

    ListController.$inject = ['AppService', 'TitleStateService', '$state', '$scope'];

    function ListController (AppService, TitleStateService, $state, $scope) {
        var vm = this;
        vm.isLoading = false;
        vm.error = false;
        vm.toggleAddForm = false;
        vm.toggleUpdateForm = false;
        vm.toggleDeleteForm = false;
        vm.lists = [];
        vm.list = { name: '' };
        vm.add = add;
        vm.update = update;
        vm.remove = remove;
        vm.onKeyPress = onKeyPress;
        vm.showAddForm = showAddForm;
        vm.showUpdateForm = showUpdateForm;
        vm.showDeleteForm = showDeleteForm;

        TitleStateService.change('<b>Manage Lists</b>');

        checkAuthorization().then(load);

        function showAddForm () {
            clearSelectedLists();

            vm.toggleAddForm = !vm.toggleAddForm;
            vm.toggleUpdateForm = false;
            vm.toggleDeleteForm = false;
            vm.error = false;
            vm.list = { name: '' };
        }

        function showUpdateForm (list) {
            clearSelectedLists();

            list.selected = true;

            vm.toggleAddForm = false;
            vm.toggleUpdateForm = true;
            vm.toggleDeleteForm = false;
            vm.error = false;
            vm.list = angular.copy(list);
        }

        function showDeleteForm (list) {
            clearSelectedLists();

            list.selected = true;

            vm.toggleAddForm = false;
            vm.toggleUpdateForm = false;
            vm.toggleDeleteForm = true;
            vm.error = false;
            vm.list = angular.copy(list);
        }

        function add(list) {
            vm.error = false;
            vm.isLoading = true;

            AppService.addList(list)
                .then(onSave)
                .catch(onError)
                .finally(stopLoading)
        }

        function update(list) {
            vm.error = false;
            vm.isLoading = true;

            AppService.updateList(list.id, list)
                .then(onSave)
                .catch(onError)
                .then(function () {
                    list.selected = false;
                    vm.toggleUpdateForm = false;
                })
                .finally(stopLoading)
        }

        function remove(list) {
            vm.isLoading = true;

            AppService.removeList(list.id)
                .then(function () {
                    vm.toggleDeleteForm = false;
                    vm.error = false;
                })
                .then(load)
                .finally(stopLoading)
        }

        function load () {
            AppService.list()
                .then(function(data) {
                    for (var i = 0; i < data.length; i++) {
                        data[i].dateAdded = new Date(data[i].dateAdded);
                        data[i].dateUpdated = new Date(data[i].dateUpdated);
                    }

                    vm.lists = data;
                });
        }

        function stopLoading() {
            vm.isLoading = false;
        }

        function onSave () {
            load();

            vm.list = { name: '' };
            vm.error = false;
        }

        function onError (error) {
            vm.error = error.data;
        }

        function onKeyPress (event) {
            var keyCode = event.which || event.keyCode;

            if (keyCode === 13) {
                if (vm.toggleAddForm) {
                    add(vm.list);
                }

                if (vm.toggleUpdateForm) {
                    update(vm.list);
                }
            }
        }

        function clearSelectedLists () {
            for (var i = 0; i < vm.lists.length; i++) {
                vm.lists[i].selected = false;
            }
        }

        function checkAuthorization() {
            return AppService.me()
                .catch(function () {
                    $state.go('home.login');
                });
        }
    }
})();

(function() {
    'use strict';

    angular.module('app.core')
        .controller('ListVersesController', ListVersesController);

    ListVersesController.$inject = ['AppService', '$stateParams', 'TitleStateService', '$state', '$scope'];

    function ListVersesController (AppService, $stateParams, TitleStateService, $state, $scope) {
        var vm = this;
        vm.isLoading = false;
        vm.error = false;
        vm.listId = $stateParams.listId;
        vm.list = {
            name: ''
        };
        vm.verses = [];
        vm.verse = {};
        vm.toggleAddForm = false;
        vm.toggleDeleteForm = false;
        vm.showAddVerseForm = showAddVerseForm;
        vm.showDeleteForm = showDeleteForm;
        vm.remove = remove;

        TitleStateService.change('<b>Manage Lists</b><span class="hide-xs"> - <i>Add Verses</i></span>');

        checkAuthorization().then(load);

        $scope.$on('verse.added', function() {
            load();
        });

        function showAddVerseForm () {
            vm.error = false;

            vm.toggleAddForm = !vm.toggleAddForm;
            vm.toggleDeleteForm = false;
        }

        function showDeleteForm (verse) {
            vm.error = false;
            verse.selected = true;

            vm.toggleAddForm = false;
            vm.toggleDeleteForm = true;
            vm.verse = angular.copy(verse);
        }

        function remove(verse) {
            vm.isLoading = true;

            AppService.removeVerseFromList(vm.listId, verse.text.id, verse.translation)
                .then(function() {
                    vm.verse = {};
                    vm.toggleDeleteForm = false;
                })
                .then(load)
                .finally(stopLoading)
        }

        function load () {
            return AppService.listById(vm.listId)
                .then(function(data) {
                    vm.list = data;

                    AppService.getVersesFromList(vm.listId)
                        .then(function(verses) {
                            vm.verses = verses;
                        });
                })
                .catch(function() {
                    $state.go('home.lists');
                });
        }

        function stopLoading() {
            vm.isLoading = false;
        }

        function checkAuthorization() {
            return AppService.me()
                .catch(function () {
                    $state.go('home.login');
                });


        }
    }
})();

(function() {
    'use strict';

    angular.module('app.core')
        .controller('LoginController', LoginController);

    LoginController.$inject = ['AppService', '$cookies', '$state', 'TitleStateService'];

    function LoginController (AppService, $cookies, $state, TitleStateService) {
        var vm = this;
        vm.error = false;
        vm.email = '';
        vm.password = '';
        vm.onKeyPress = onKeyPress;
        vm.login = login;

        TitleStateService.change('Login');

        function login() {
            vm.error = false;

            AppService.login(vm.email, vm.password)
                .then(onLogin)
                .catch(onLoginError);
        }

        function onLogin() {
            $state.go('home.list');
        }

        function onLoginError(error) {
            $cookies.remove('token');

            vm.error = error.data;
        }

        function onKeyPress (event) {
            var keyCode = event.which || event.keyCode;

            if (keyCode === 13) {
                login();
            }
        }
    }
})();

(function() {
    'use strict';

    angular.module('app.core')
        .controller('LogoutController', LogoutController);

    LogoutController.$inject = ['AppService', '$cookies', 'TitleStateService', '$state'];

    function LogoutController (AppService, $cookies, TitleStateService, $state) {
        TitleStateService.change('Logout');

        AppService.logout()
            .finally(function() {
                // $cookies.remove('token');

                $state.go('home.login');
            });
    }
})();

(function() {
    'use strict';

    angular.module('app.core')
        .controller('RegisterController', RegisterController);

    RegisterController.$inject = ['AppService', '$state', 'TitleStateService'];

    function RegisterController (AppService, $state, TitleStateService) {
        var vm = this;
        vm.error = false;
        vm.email = '';
        vm.password = '';
        vm.passwordConf = '';
        vm.onKeyPress = onKeyPress;
        vm.register = register;

        TitleStateService.change('Register');

        function register() {
            vm.error = false;

            AppService.register(vm.email, vm.password, vm.passwordConf)
                .then(onRegister)
                .catch(onRegisterError);
        }

        function onRegisterError(error) {
            vm.error = error.data;
        }

        function onRegister() {
            AppService.login(vm.email, vm.password).then(onLogin);
        }

        function onLogin() {
            $state.go('home.list');
        }

        function onKeyPress (event) {
            var keyCode = event.which || event.keyCode;

            if (keyCode === 13) {
                register();
            }
        }

    }
})();

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
                for (var i = 0; i < books.length; i++) {
                    books[i].testament = (books[i].testament === 'OT') ? 'Old Testament' : 'New Testament';
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

                        if (TranslationStateService.getCurrent().toLowerCase() == translations[i].abbreviation.toLowerCase()) {
                            vm.selected.translation = translations[i];
                        }
                    }

                    vm.translations = translations;
                    vm.isLoading = false;
                });
        }

        function onSelectTranslation (translation) {
            vm.selected.translation = translation;

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
            search: search,
            searchAggregation: searchAggregation
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

        function searchAggregation (query, translation) {
            return _get('/searchAggregator', {
                params: {
                    query: query,
                    translation: translation
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
        .service('AppService', AppService);

    AppService.$inject = ['$http', 'APP_API_URL', '$q'];

    function AppService($http, APP_API_URL, $q) {
        return {
            login: login,
            register: register,
            me: me,
            list: list,
            listById: listById,
            addList: addList,
            removeList: removeList,
            updateList: updateList,
            getVersesFromList: getVersesFromList,
            addVerseToList: addVerseToList,
            removeVerseFromList: removeVerseFromList,
            logout: logout
        };

        function getVersesFromList (listId) {
            return _get('/lists/' + listId + '/verses', {
                withCredentials: true
            });
        }

        function addVerseToList (listId, verseId, translation) {
            return _put('/lists/' + listId + '/verses/' + verseId + '?translation=' + translation, {}, {
                withCredentials: true
            });
        }

        function removeVerseFromList (listId, verseId, translation) {
            return _delete('/lists/' + listId + '/verses/' + verseId + '?translation=' + translation, {
                withCredentials: true
            });
        }

        function login (email, password) {
            return _post('/authenticate', {
                email: email,
                password: password
            }, {
                withCredentials: true
            });
        }

        function me () {
            return _get('/authenticate/me', {
                withCredentials: true
            });
        }

        function logout () {
            return _get('/authenticate/logout', {
                withCredentials: true
            });
        }

        function list () {
            return _get('/lists', {
                withCredentials: true
            });
        }

        function listById (id) {
            return _get('/lists/' + id, {
                withCredentials: true
            });
        }

        function addList (list) {
            return _post ('/lists', list, {
                withCredentials: true
            });
        }

        function updateList (id, list) {
            return _put ('/lists/' + id, list, {
                withCredentials: true
            });
        }

        function removeList (id) {
            return _delete ('/lists/' + id, {
                withCredentials: true
            });
        }

        function register (email, password, passwordConf) {
            return _post('/register', {
                email: email,
                password: password,
                passwordConf: passwordConf
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

        function _post (endpoint, data, options) {
            var url = APP_API_URL + endpoint,
                httpOptions = _getHttpOptions(endpoint, options);

            return $http.post(url, data, httpOptions).then(function(response) {
                return response.data;
            })
        }

        function _put (endpoint, data, options) {
            var url = APP_API_URL + endpoint,
                httpOptions = _getHttpOptions(endpoint, options);

            return $http.put(url, data, httpOptions).then(function(response) {
                return response.data;
            })
        }

        function _get (endpoint, options) {
            var url = APP_API_URL + endpoint,
                httpOptions = _getHttpOptions(endpoint, options);

            return $http.get(url, httpOptions).then(function(response) {
                return response.data;
            })
        }

        function _delete (endpoint, options) {
            var url = APP_API_URL + endpoint,
                httpOptions = _getHttpOptions(endpoint, options);

            return $http.delete(url, httpOptions).then(function(response) {
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
        .service('TranslationStateService', ['$cookies', '$stateParams', 'DEFAULT_TRANSLATION', TranslationStateService]);

    function TranslationStateService ($cookies, $stateParams, DEFAULT_TRANSLATION) {
        var changeFns = {};

        if ($stateParams.hasOwnProperty('translation')) {
            $cookies.put('translation', $stateParams.translation);
        }

        if (typeof $cookies.get('translation') === 'undefined') {
            $cookies.put('translation', DEFAULT_TRANSLATION);
        }

        return {
            change: change,
            onChange: onChange,
            getCurrent: getCurrent,
            unsubscribe: unsubscribe
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

        function unsubscribe (key) {
            changeFns[key] = null;

            delete changeFns[key];
        }
    }
})();
