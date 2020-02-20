(function() {
    'use strict';

    angular.module('app.core')
        .controller('LogoutController', LogoutController);

    LogoutController.$inject = ['AppService', '$cookies', 'TitleStateService', '$state'];

    function LogoutController (AppService, $cookies, TitleStateService, $state) {
        TitleStateService.change('Logout');

        AppService.logout()
            .finally(function() {
                $cookies.remove('token');

                $state.go('home.login');
            });
    }
})();
