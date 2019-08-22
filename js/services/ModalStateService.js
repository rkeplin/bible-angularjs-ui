(function() {
    'use strict';

    angular.module('app.core')
        .service('ModalStateService', ModalStateService);

    function ModalStateService () {
        var openFns = [],
            closeFn = null;

        return {
            open: open,
            onOpen: onOpen,
            close: close,
            onClose: onClose,
            clear: clear
        };

        function clear () {
            openFns = [];
        }

        function open (verseId) {
            if (openFns.length === 0) {
                return false;
            }

            for (var i = 0; i < openFns.length; i++) {
                openFns[i](verseId);
            }
        }

        function close () {
            if (closeFn == null) {
                return false;
            }

            closeFn();
        }

        function onOpen(callback) {
            openFns.push(callback);
        }

        function onClose(callback) {
            closeFn = callback;
        }
    }
})();
