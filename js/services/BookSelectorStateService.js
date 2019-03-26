(function() {
    'use strict';

    angular.module('app.core')
        .service('BookSelectorStateService', BookSelectorStateService);

    function BookSelectorStateService () {
        var subscriptions = [];

        return {
            subscribe: subscribe,
            unsubscribe: unsubscribe,
            publish: publish
        };

        function subscribe (topic, fn) {
            subscriptions[topic] = fn;
        }

        function unsubscribe (topic) {
            delete subscriptions[topic];
        }

        function publish (topic) {
            subscriptions[topic]();
        }
    }
})();
