(function() {
    'use strict';

    angular.module('app.core')
        .service('ApiService', ApiService);

    ApiService.$inject = ['$http', 'API_URL', '$q'];

    function ApiService($http, API_URL, $q) {
        return {
            getTranslations: getTranslations,
            getCrossReferences: getCrossReferences,
            getBooks: getBooks,
            getChaptersFromBook: getChaptersFromBook,
            getMaxChapterFromBook: getMaxChapterFromBook,
            getText: getText,
            search: search,
            searchAggregation: searchAggregation
        };

        function getTranslations () {
            return _get('/translations');
        }

        function getCrossReferences (verseId, translation) {
            return _get('/verse/' + verseId + '/relations', {
                params: {
                    translation: translation
                }
            });
        }

        function getBooks () {
            return _get('/books');
        }

        function getChaptersFromBook (bookId) {
            return _get('/books/' + bookId + '/chapters');
        }

        function getMaxChapterFromBook (bookId) {
            var deferred = $q.defer();

            _get('/books/' + bookId + '/chapters')
                .then(function(data) {
                    deferred.resolve(data[data.length - 1].id);
                }).catch(function() {
                    deferred.reject();
                });

            return deferred.promise;
        }

        function getText (bookId, chapterId, translation) {
            return _get('/books/' + bookId + '/chapters/' + chapterId, {
                params: {
                    translation: translation
                }
            });
        }

        function search (query, translation, offset, limit) {
            return _get('/search', {
                params: {
                    query: query,
                    translation: translation,
                    offset: offset,
                    limit: limit
                }
            });
        }

        function searchAggregation (query, translation) {
            return _get('/searchAggregator', {
                params: {
                    query: query,
                    translation: translation
                }
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

        function _get (endpoint, options) {
            var url = API_URL + endpoint,
                httpOptions = _getHttpOptions(endpoint, options);

            return $http.get(url, httpOptions).then(function(response) {
                return response.data;
            })
        }
    }
})();
