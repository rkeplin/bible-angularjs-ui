FROM fedora:latest

RUN dnf -y update \
 && dnf -y install httpd npm at wget \
 && dnf clean all

RUN echo "ServerName localhost" >> /etc/httpd/conf/httpd.conf
RUN apachectl configtest

RUN wget https://dl-ssl.google.com/dl/linux/direct/mod-pagespeed-stable_current_x86_64.rpm
RUN rpm -Uvh mod-pagespeed-stable_current_x86_64.rpm

RUN ln -sf /dev/stdout /var/log/httpd/access_log \
 && ln -sf /dev/stderr /var/log/httpd/error_log

EXPOSE 80

COPY conf.d/local.conf /etc/httpd/conf.d/local.conf

WORKDIR /var/www/html

COPY build build
COPY css css
COPY js js
COPY .htaccess .htaccess
COPY favicon.png favicon.png
COPY index.html index.html

CMD /usr/sbin/httpd -D FOREGROUND
