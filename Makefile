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
	jshint core
