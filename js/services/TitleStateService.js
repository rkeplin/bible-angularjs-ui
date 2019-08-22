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
