# Bible AngularJS UI

[![Build Status](https://travis-ci.org/rkeplin/bible-angularjs-ui.svg?branch=master)](https://travis-ci.org/rkeplin/bible-angularjs-ui)

Bible AngularJS UI is an open source project that displays multiple translations of The Holy Bible and verse cross references. 
This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY.

### Live Demo
A live demo of this application can be viewed [here](https://bible-ui.rkeplin.com).

[![alt text](https://raw.githubusercontent.com/rkeplin/bible-angularjs-ui/master/img/screenshot.png "Screenshot")](https://bible-ui.rkeplin.com)

### Getting Everything Running 
```bash
git clone https://www.github.com/rkeplin/bible-angularjs-ui
cd bible-angularjs-ui && docker-compose up -d
```
Note: Upon first start, the volume containing the MySQL data may take several seconds to load.

You should then be able to access [http://localhost:8082](http://localhost:8082).

### Related Projects
* [Bible Go API](https://www.github.com/rkeplin/bible-go-api)
* [Bible PHP API](https://www.github.com/rkeplin/bible-php-api)
* [Bible AngularJS UI](https://www.github.com/rkeplin/bible-angularjs-ui)
* [Bible MariaDB Docker Image](https://www.github.com/rkeplin/bible-mariadb)

### Credits
Data for this application was gathered from the following repositories.
* [scrollmaper/bible_database](https://github.com/scrollmapper/bible_databases)
* [honza/bibles](https://github.com/honza/bibles)

### Thanks
<a href="https://www.browserstack.com/"><img src="https://user-images.githubusercontent.com/1911623/66797775-4d651300-eee2-11e9-9072-ef1dc670af1d.png" width="150" height="auto"/></a>
[BrowserStack](https://www.browserstack.com/) for letting Open Source projects use their services for free.
