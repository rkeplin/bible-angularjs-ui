#!/bin/bash
set -e

if [ ! -z "${URL}" ]; then
    sed -i "s|http://localhost:8082|${URL}|g" /var/www/html/build/env.js
    sed -i "s|http://bible-ui.rkeplin.local|${URL}|g" /var/www/html/build/env.js
fi

if [ ! -z "${API_URL}" ]; then
    sed -i "s|http://localhost:8084|${API_URL}|g" /var/www/html/build/env.js
    sed -i "s|http://bible-go-api.rkeplin.local/v1|${API_URL}|g" /var/www/html/build/env.js
fi

if [ ! -z "${APP_API_URL}" ]; then
    sed -i "s|http://localhost:8083|${APP_API_URL}|g" /var/www/html/build/env.js
    sed -i "s|http://bible-php-api.rkeplin.local/v1|${APP_API_URL}|g" /var/www/html/build/env.js
fi

exec "$@"
