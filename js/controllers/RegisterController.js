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

        window.scrollTo(0, 0);

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
