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

        window.scrollTo(0, 0);

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
