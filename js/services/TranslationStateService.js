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
