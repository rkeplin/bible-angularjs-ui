# Bible AngularJS UI

Bible AngularJS UI is an open source project that displays multiple translations of The Holy Bible and verse cross references. 
This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY.

### Included Translations
* American Standard-ASV1901 (ASV)
* Bible in Basic English (BBE)
* Darby English Bible (DARBY)
* King James Version (KJV)
* World English Bible (WEB)
* Young's Literal Translation (YLT)
* English Standard Version (ESV)
* New International Version (NIV)
* New Living Translation (NLT)

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
* [Bible PHP API](https://www.github.com/rkeplin/bible-php-api)
* [Bible AngularJS UI](https://www.github.com/rkeplin/bible-angularjs-ui)
* [Bible MariaDB Docker Image](https://www.github.com/rkeplin/bible-mariadb)

### Credits
Data for this application was gathered from the following repositories.
* [scrollmaper/bible_database](https://github.com/scrollmapper/bible_databases)
* [honza/bibles](https://github.com/honza/bibles)

### License
This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see http://www.gnu.org/licenses/.
