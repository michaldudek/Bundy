var compressor = require('node-minify'),
	fs = require('fs'),
	util = require('util'),
	clc = require('cli-color'),

	// get local utils as well
	utils = require('./utils.js'),

	/**
	 * Bundy version tag.
	 * 
	 * @type {String}
	 */
	ver = require('../package.json').version,

	// define a console theme
	thBold = clc.bold,
	thError = clc.bgRed.bold,
	thInfo = clc.green.bold,
	thInfoMark = clc.underline,
	thWarning = clc.red.bold,

	// shortcuts
	NL = "\n",
	TAB = "\t",

	/**
	 * Holds all Bundy jobs to be done (because we want them synchronous).
	 * 
	 * @type {Array}
	 */
	jobs = [];

// announce itself
utils.log();
utils.log(thBold('BUNDY v' + ver + ':') + ' Bundling your package...');
utils.log();

/**
 * Calls the next job in order or breaks the program if there aren't any jobs left.
 */
var doNext = function() {
	if (!jobs.length) {
		// if no jobs left then report it and exit
		utils.log(thBold('BUNDY: All Done.'));
		process.exit();
	}

	// continue on to the next job
	jobs.shift().call();
};

/**
 * Concatenates and minifies the given JavaScript files into a single file.
 * Uses Google Closure Java Application to minify the JavaScript.
 * 
 * @param  {String|Array} src  Either a path to a single file or an array of paths to multiple files.
 * @param  {String} dest Path to destination file.
 */
exports.js = function(src, dest) {
	// automatically and immediatelly push to jobs
	jobs.push(function() {
		// make sure src is an array
		src = (typeof src === 'string') ? [src] : src;

		var totalFileSize = 0;

		// announce
		utils.log(thInfo('Bundling ' + thInfoMark(src.length) + ' JavaScript file(s)...'));

		// go over all files and check their existence and sizes
		src.forEach(function(file) {
			if (!fs.existsSync(file)) {
				return utils.logError('File "' + thInfoMark(file) + '" does not exist!');
			}

			// get the file size and add it to total file size
			var fileSize = fs.statSync(file).size;
			totalFileSize = totalFileSize + fileSize;

			// report on the file
			utils.log(TAB + file + TAB + '(' + utils.bytesToString(fileSize, 2)  + ')');
		});

		// don't report total size if there's only 1 file
		if (src.length > 1) {
			utils.log(thBold('Total: ') + utils.bytesToString(totalFileSize, 2));
		}

		// ensure the destination folder path exists
		var createdPath = utils.createPath(dest);

		// finally launch the compressor
		new compressor.minify({
			type : 'gcc',
			fileIn : src,
			fileOut : dest,
			callback : function(err) {
				if (err) {
					return utils.logError(err);
				}

				// get the compressed size
				var compressedSize = fs.statSync(dest).size;

				// report on what we achieved
				utils.log(thInfo('Compressed: ') + utils.bytesToString(compressedSize, 2) + ' (' + utils.formatNumber(compressedSize / totalFileSize * 100) + '%)');
				utils.log(thInfo('Saved:  ') + dest);
				utils.log();

				// and continue to the next job
				doNext();
			}
		});
	});
};

/**
 * Concatenates and minifies the given CSS files into a single file.
 * Uses YUI library to minify the CSS.
 * 
 * @param  {String|Array} src  Either a path to a single file or an array of paths to multiple files.
 * @param  {String} dest Path to destination file.
 */
exports.css = function(src, dest) {
	// automatically and immediatelly push to jobs
	jobs.push(function() {
		// make sure src is an array
		src = (typeof src === 'string') ? [src] : src;

		var totalFileSize = 0;

		// announce
		utils.log(thInfo('Bundling ' + thInfoMark(src.length) + ' CSS file(s)...'));

		// go over all files and check their existence and sizes
		src.forEach(function(file) {
			if (!fs.existsSync(file)) {
				return utils.logError('File "' + thInfoMark(file) + '" does not exist!');
			}

			// get the file size and add it to total file size
			var fileSize = fs.statSync(file).size;
			totalFileSize = totalFileSize + fileSize;

			// report on the file
			utils.log(TAB + file + TAB + '(' + utils.bytesToString(fileSize, 2) + ')');
		});

		// don't report total size if there's only 1 file
		if (src.length > 1) {
			utils.log(thBold('Total: ') + utils.bytesToString(totalFileSize, 2));
		}

		// ensure the destination folder path exists
		var createdPath = utils.createPath(dest);

		// finally launch the compressor
		new compressor.minify({
			type : 'yui-css',
			fileIn : src,
			fileOut : dest,
			callback : function(err) {
				if (err) {
					return utils.logError(err);
				}

				// get the compressed size
				var compressedSize = fs.statSync(dest).size;

				// report on what we achieved
				utils.log(thInfo('Compressed: ') + utils.bytesToString(compressedSize, 2) + ' (' + utils.formatNumber(compressedSize / totalFileSize * 100) + '%)');
				utils.log(thInfo('Saved:  ') + dest);
				utils.log();

				// and continue to the next job
				doNext();
			}
		});
	});
};

/**
 * Copies the given files to the destination.
 * 
 * @param  {String|Array} src  Either a path to a single file or an array of paths to multiple files.
 * @param  {String} dest Path to destination location directory (when copying multiple files) or specific file (only when copying a single file).
 */
exports.copy = function(src, dest) {
	// automatically and immediatelly push to jobs
	jobs.push(function() {
		// single file copy
		if (typeof src === 'string') {
			// if a folder path was given then append the original file name to it
			if (dest.charAt(dest.length - 1) === '/') {
				dest = dest + utils.getFileName(src);
			}

			// announce
			utils.log(thInfo('Copying...') + TAB + src + TAB + ' -> ' + TAB + dest);

			// copy the file
			utils.copyFile(src, dest, function(err) {
				if (err) {
					return utils.logError(err);
				}

				utils.log();

				// and continue to the next job
				doNext();
			});

			return;
		}

		// multiple files to be copied
		// therefore a folder needs to be specified, not a file
		if (dest.charAt(dest.length - 1) !== '/') {
			utils.logError('You need to specify a directory (must end with "/") in 2nd argument of bundle.copy() when copying multiple files! "' + thInfoMark(dest) + '" given.');
		}

		// announce
		utils.log(thInfo('Copying ' + thInfoMark(src.length) + ' file(s)...'));

		// hold all copy actions in this array
		var actions = [];

		// similar to doNext(), goes through all the required actions
		var copyNext = function() {
			if (!actions.length) {
				// if no copy actions left then report it and continue to the next job
				utils.log(thInfo('Copied.'));
				utils.log();

				return doNext();
			}

			// continue on to the copy action
			actions.shift().call();
		};

		// go over all files and add them as copy actions
		src.forEach(function(file) {
			actions.push(function() {
				// prepare file destination path
				var fileDest = dest + utils.getFileName(file);

				// report on copying this file
				utils.log(TAB + file + TAB + ' -> ' + TAB + fileDest);

				// copy the file
				utils.copyFile(file, fileDest, function(err) {
					if (err) {
						return utils.logError(err);
					}

					// move on to the next copy action
					copyNext();
				});
			});
		});

		// initialize copying of all files
		copyNext();
	});
};

// export a .build() function
exports.build = doNext;

// exit the app on SIGINT
process.on('SIGINT', function() {
	utils.log(NL + NL + thWarning('Exiting on demand...'));
	process.exit();
});