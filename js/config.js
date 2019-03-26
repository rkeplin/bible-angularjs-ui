var coreAppEnv = {};

if (window) {
    coreAppEnv = angular.extend(coreAppEnv, window.__coreAppEnv);
}

angular.module('app.core')
    .value('URL', coreAppEnv.URL)
    .value('API_URL', coreAppEnv.API_URL)
    .value('DEFAULT_TRANSLATION', coreAppEnv.DEFAULT_TRANSLATION);
