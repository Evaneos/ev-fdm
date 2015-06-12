install:
	npm install
	bower install
	gem install github-pages

serve:
	gulp
	bundle exec jekyll serve
