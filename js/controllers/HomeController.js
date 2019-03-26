(function() {
    'use strict';

    angular.module('app.core')
        .controller('HomeController', HomeController);

    HomeController.$inject = ['$state'];

    function HomeController ($state) {
        if ($state.$current.name === 'home') {
            $state.go('home.book', {
                'bookId': 1,
                'chapterId': 1
            }, {reload: true});
        }
    }
})();
