ev-fdm
======

Framework de Malade / Framework de Merde / Faute de Mieux

This is the JS and CSS framework used for the backoffice of Evaneos.com

## Architecture of the repository

This repository contains the following things:

 - the main framework code, in the `core` directory
 - the plugin code, available in the `plugin` directory
 - the compiled files, in the dist directory

NB: Different compiled files can be found. You'll have the default ones, with all the js files from plugins and core concatenated in one file (`ev-fdm-core-and-plugins.js`). But also the `js` files before concatenation, corresponding to the `core` and `plugins`

## Requirements

If you simply want to use the framework, you simly need to have bower installed, as you can see in the demo.

However if you want to recompile the sources, this framework require the following applications to be installed :

 - node
 - npm
 - gulp
 - bower

## Using the demo

in the demo repository, execute

    bower install

and you are good to go !

## Compiling the framework

At the root of the project, run

    bower install && gulp