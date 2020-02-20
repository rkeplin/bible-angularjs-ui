(function() {
    'use strict';

    angular.module('app.core')
        .service('AppService', AppService);

    AppService.$inject = ['$http', 'APP_API_URL', '$q'];

    function AppService($http, APP_API_URL, $q) {
        return {
            login: login,
            register: register,
            me: me,
            list: list,
            listById: listById,
            addList: addList,
            removeList: removeList,
            updateList: updateList,
            getVersesFromList: getVersesFromList,
            addVerseToList: addVerseToList,
            removeVerseFromList: removeVerseFromList,
            logout: logout
        };

        function getVersesFromList (listId) {
            return _get('/lists/' + listId + '/verses', {
                withCredentials: true
            });
        }

        function addVerseToList (listId, verseId, translation) {
            return _put('/lists/' + listId + '/verses/' + verseId + '?translation=' + translation, {}, {
                withCredentials: true
            });
        }

        function removeVerseFromList (listId, verseId, translation) {
            return _delete('/lists/' + listId + '/verses/' + verseId + '?translation=' + translation, {
                withCredentials: true
            });
        }

        function login (email, password) {
            return _post('/authenticate', {
                email: email,
                password: password
            }, {
                withCredentials: true
            });
        }

        function me () {
            return _get('/authenticate/me', {
                withCredentials: true
            });
        }

        function logout () {
            return _get('/authenticate/logout', {
                withCredentials: true
            });
        }

        function list () {
            return _get('/lists', {
                withCredentials: true
            });
        }

        function listById (id) {
            return _get('/lists/' + id, {
                withCredentials: true
            });
        }

        function addList (list) {
            return _post ('/lists', list, {
                withCredentials: true
            });
        }

        function updateList (id, list) {
            return _put ('/lists/' + id, list, {
                withCredentials: true
            });
        }

        function removeList (id) {
            return _delete ('/lists/' + id, {
                withCredentials: true
            });
        }

        function register (email, password, passwordConf) {
            return _post('/register', {
                email: email,
                password: password,
                passwordConf: passwordConf
            });
        }

        function _getHttpOptions (endpoint, options) {
            var defaultOptions = {},
                httpOptions = {};

            if (typeof options === 'object') {
                httpOptions = angular.extend(options, defaultOptions)
            } else {
                httpOptions = defaultOptions;
            }

            return httpOptions;
        }

        function _post (endpoint, data, options) {
            var url = APP_API_URL + endpoint,
                httpOptions = _getHttpOptions(endpoint, options);

            return $http.post(url, data, httpOptions).then(function(response) {
                return response.data;
            })
        }

        function _put (endpoint, data, options) {
            var url = APP_API_URL + endpoint,
                httpOptions = _getHttpOptions(endpoint, options);

            return $http.put(url, data, httpOptions).then(function(response) {
                return response.data;
            })
        }

        function _get (endpoint, options) {
            var url = APP_API_URL + endpoint,
                httpOptions = _getHttpOptions(endpoint, options);

            return $http.get(url, httpOptions).then(function(response) {
                return response.data;
            })
        }

        function _delete (endpoint, options) {
            var url = APP_API_URL + endpoint,
                httpOptions = _getHttpOptions(endpoint, options);

            return $http.delete(url, httpOptions).then(function(response) {
                return response.data;
            })
        }
    }
})();
