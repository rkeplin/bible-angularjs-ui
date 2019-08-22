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
