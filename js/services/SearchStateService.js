(function() {
    'use strict';

    angular.module('app.core')
        .service('SearchStateService', SearchStateService);

    function SearchStateService () {
        var subscriptionFn;

        return {
            onReady: onReady,
            unsubscribe: unsubscribe,
            ready: ready
        };

        function onReady (fn) {
            subscriptionFn = fn;
        }

        function unsubscribe () {
            subscriptionFn = null;
        }

        function ready () {
            if (subscriptionFn != null) {
                subscriptionFn();
            }
        }
    }
})();
