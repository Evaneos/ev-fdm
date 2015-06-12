install:
	npm install
	bower install
	bundle install

serve:
	gulp
	bundle exec jekyll serve
