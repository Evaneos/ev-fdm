EV-FDM DEMO
===========

## Getting started

- Install Jekyll gem:

```
$ gem install jekyll
```

For gem to install jekyll, you need to install ruby dev packages.
For exemple in Ubuntu:

```
$ apt-get install ruby1.9.1-dev
```

- Retrieve dependencies:

```
$ make install
```

- Start gulp with default task and in watch mode:

```
$ make watch
```

- Start jekyll (only necessary if not on docker)

```
jekyll serve --watch
```

## Folder structure

Each demo has its own separated application. All the application folder can be found in `docs/_demos`.

## Usefull links

- [EVFDM demo website](http://evfdmdemo.dev.evaneos.com)
- [EVFDM source code](https://github.com/evaneos/ev-fdm)
- [Jekyll documentation](http://jekyllrb.com/)

## Deploy

Use fabric with the following command:

```
fab deploy:branch=master
```
