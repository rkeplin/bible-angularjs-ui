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
