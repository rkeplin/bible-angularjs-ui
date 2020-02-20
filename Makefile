.PHONY: up
up:
	@echo "============= Spinning Everything Up ============="
	docker-compose up -d

.PHONY: down
down:
	@echo "============= Taking Everything Down ============="
	docker-compose down

.PHONY: logs
logs:
	@echo "============= View Logs ============="
	docker-compose logs -f

.PHONY: app
app:
	@echo "============= Build App ============="
	docker exec -it bible-angularjs-ui_bible-ui_1 /var/www/html/node_modules/grunt/bin/grunt app

.PHONY: appJs
appJs:
	@echo "============= Build App JS ============="
	docker exec -it bible-angularjs-ui_bible-ui_1 /var/www/html/node_modules/grunt/bin/grunt appJs

.PHONY: appCss
appCss:
	@echo "============= Build App JS ============="
	docker exec -it bible-angularjs-ui_bible-ui_1 /var/www/html/node_modules/grunt/bin/grunt appCss

.PHONY: vendor
vendor:
	@echo "============= Build App JS ============="
	docker exec -it bible-angularjs-ui_bible-ui_1 /var/www/html/node_modules/grunt/bin/grunt vendor

.PHONY: all
all:
	@echo "============= Build Everything ============="
	docker exec -it bible-angularjs-ui_bible-ui_1 /var/www/html/node_modules/grunt/bin/grunt
