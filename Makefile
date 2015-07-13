install:
	npm install
	bower install

clean:
	rm -Rf dist

build:
	node_modules/.bin/gulp

watch:
	node_modules/.bin/gulp watch

lint:
	node_modules/.bin/jshint core
