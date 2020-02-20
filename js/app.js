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
