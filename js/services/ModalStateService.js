(function() {
    'use strict';

    angular.module('app.core')
        .service('ModalStateService', ModalStateService);

    function ModalStateService () {
        var openFn = null,
            closeFn = null;

        return {
            open: open,
            onOpen: onOpen,
            close: close,
            onClose: onClose
        };

        function open (verseId) {
            if (openFn == null) {
                return false;
            }

            openFn(verseId);
        }

        function close () {
            if (closeFn == null) {
                return false;
            }

            closeFn();
        }

        function onOpen(callback) {
            openFn = callback;
        }

        function onClose(callback) {
            closeFn = callback;
        }
    }
})();
