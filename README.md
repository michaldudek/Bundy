Bundy
=====
Easy and lightweight tool to quickly bundle JavaScript (and CSS and other assets) releases.

If you are working on a JavaScript library, plugin or a widget and want to quickly "bundle" it (minify all JavaScript and CSS files, put them in single files, copy other assets, eg. images and fonts, to release directory), then Bundy is for you.

Usage
=====

## Installation

    $ cd [your working dir]
    $ npm install bundy

## Create Bundy build file

Create `bundy.js` file in which you will describe the build process. It should at least contain the following:

    var bundy = require('bundy');

    // your build process here

    bundy.build(); // this always needs to be at the end of the file

The last line will tell Bundy to start processing what you told it do to.

## Describing your build process

Bundy can do 3 tasks:

#### Minify JavaScript

    bundy.js([
        'src/lib/required.library.js',
        'src/lib/required.library2.js',
        'src/myplugin.core.js',
        'src/myplugin.js'
    ], 'minified/myplugin.min.js');

This will concatenate and minify the four given files and save the result in `minified/myplugin.min.js`.

Google Closure Compiler Java application is used to minify the JavaScript, therefore you need JVE installed and enabled.

#### Minify CSS

    bundy.css('src/myplugin.css', 'minified/myplugin.min.css');

This will minify the given CSS file and save it in `minified/myplugin.min.css`.

YUI is used to minify the CSS and JVE is required to be able to use it.

`bundy.css()`, just like `bundy.js()` can also accept array of files as 1st argument, in which case the files will be concatenated and minified.

#### Copy files

    bundy.copy([
        'src/img/sprite.png',
        'src/img/sprite@2x.png',
        'src/img/spinner.gif',
        'src/img/logo.png'
    ], 'minified/img/');

This will copy the given four files into `minified/img/` directory keeping the original file names.

You can also copy a single file and change its' name:

    bundy.copy('src/img/some_image.png', 'minified/img/the_image.png');

Or you can copy a single file and ommit its' file name in destination, in which case the original file name will be kept:

    bundy.copy('src/img/another_image.png', 'minified/img/');

## Running Bundy

Once installed and created `bundy.js` simply run it:

    $ node bundy.js

Example
=======

Example `bundy.js` file:

    var bundy = require('./lib/bundy');

    bundy.js([
        'src/lib/crypto.md5.min.js',
        'src/lib/jquery.ui.custom.min.js',
        'src/lib/jquery.touchpunch.js',
        'src/lib/jquery.tipsy.js',
        'src/lib/jquery.simulate.js',
        'src/acme.core.js',
        'src/acme.gui.js',
        'src/acme.widget.js'
    ], 'minified/acme.min.js');

    bundy.copy('src/acme.config.js', 'minified/acme.config.js');

    bundy.css([
        'src/lib/jquery.ui.custom.min.css',
        'src/lib/jquery.tipsy.css',
        'src/acme.css'
    ], 'minified/acme.min.css');

    bundy.copy([
        'src/img/elements.png',
        'src/img/elements@2x.png',
        'src/img/icons.png',
        'src/img/icons@2x.png',
        'src/img/jquery.tipsy.small.gif',
        'src/img/loader.gif'
    ], 'try/minified/img/');

    bundy.build();

Why?
====

Why another builder/minifier for JavaScript? There's [Grunt](http://gruntjs.com/) and a lot of other tools for that, but I just wanted something small and simple to quickly package mainly browser-based JavaScript plugins.

Credits
=======

Bundy is using the following:

* [Google Closure Compiler](https://developers.google.com/closure/compiler/) - Java application for minification of JavaScript
* [YUI Compressor](http://developer.yahoo.com/yui/compressor/) - Java application for minification of JavaScript and CSS
* [node-minify](https://github.com/srod/node-minify) - simple and easy to use node wrapper around the 2 above
* [cli-color](https://github.com/medikoo/cli-color) - for coloring terminal output