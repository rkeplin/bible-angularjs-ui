(function() {
    'use strict';

    angular.module('app.core')
        .service('TranslationStateService', ['$cookies', 'DEFAULT_TRANSLATION', TranslationStateService]);

    function TranslationStateService ($cookies, DEFAULT_TRANSLATION) {
        var changeFns = [];

        if (typeof $cookies.get('translation') === 'undefined') {
            $cookies.put('translation', DEFAULT_TRANSLATION);
        }

        return {
            change: change,
            onChange: onChange,
            getCurrent: getCurrent,
            clearOnChangeListeners: clearOnChangeListeners
        };

        function change (translation) {
            $cookies.put('translation', translation.abbreviation);

            for (var i = 0; i < changeFns.length; i++) {
                changeFns[i](translation);
            }
        }

        function onChange (callback) {
            changeFns.push(callback);
        }

        function getCurrent () {
            return $cookies.get('translation');
        }

        function clearOnChangeListeners () {
            changeFns = [];
        }
    }
})();
