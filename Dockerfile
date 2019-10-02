FROM fedora:30

RUN dnf -y update \
 && dnf -y install httpd npm at wget \
 && dnf clean all

RUN echo "ServerName localhost" >> /etc/httpd/conf/httpd.conf
RUN sed -i 's/LogFormat "%h/LogFormat "%{X-Forwarded-For}i - %h/g' /etc/httpd/conf/httpd.conf

RUN ln -sf /dev/stdout /var/log/httpd/access_log \
 && ln -sf /dev/stderr /var/log/httpd/error_log

EXPOSE 80

COPY .docker/docker-entrypoint.sh /docker-entrypoint.sh
COPY .docker/local.conf /etc/httpd/conf.d/local.conf

WORKDIR /var/www/html

COPY build build
COPY sitemaps sitemaps
COPY css css
COPY js js
COPY .htaccess .htaccess
COPY android-chrome-192x192.png android-chrome-192x192.png
COPY android-chrome-512x512.png android-chrome-512x512.png
COPY apple-touch-icon.png apple-touch-icon.png
COPY favicon.ico favicon.ico
COPY favicon-16x16.png favicon-16x16.png
COPY favicon-32x32.png favicon-32x32.png
COPY site.webmanifest site.webmanifest
COPY index.html index.html

ENTRYPOINT ["/docker-entrypoint.sh", "/usr/sbin/httpd", "-D", "FOREGROUND"]
