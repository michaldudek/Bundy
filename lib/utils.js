var fs = require('fs'),
	clc = require('cli-color'),

	NL = "\n";

/**
 * Prints out the given string to stdout with new line.
 * 
 * @param  {String} str String to be printed out.
 */
exports.log = function(str) {
	str = str || '';
	process.stdout.write(str + NL);
};

/**
 * Prints out the given error string to stdout.
 * 
 * @param  {String} str Error string to be printed out.
 */
var logError = exports.logError = function(str) {
	str = str || '';
	process.stdout.write(clc.bgRed.bold(NL + 'ERROR: ' + str) + NL);
	process.exit();
};

/**
 * Returns file name from the given string (assuming it's a file path).
 * 
 * @param  {String} str File path.
 * @return {String}     File name.
 */
exports.getFileName = function(str) {
	return str.split('/').pop();
};

/**
 * Shortcut to copying a file from src to dest.
 * 
 * @param  {String}   src      Path to the file to copy.
 * @param  {String}   dest     Path to the destination.
 * @param  {Function} callback Callback.
 * @return {WritableStream} Destination stream.
 */
exports.copyFile = function(src, dest, callback) {
	if (!fs.existsSync(src)) {
		return logError('File "' + clc.underline(src) + '" does not exist!');
	}

	// must create path as well, if needed
	var createdPath = createPath(dest);

	var readStream = fs.createReadStream(src),
		destStream = fs.createWriteStream(dest);

	// register the callback on write close event
	destStream.on('close', callback);

	// pipe it!
	readStream.pipe(destStream);

	// return the destination stream if someone's interested
	return destStream;
};

/**
 * Creates a folder structure for the given path if none yet exists.
 * Works in the current path, will not work for absolute paths.
 * 
 * @param  {String} path Path to be created.
 * @return {Boolean} Always true.
 */
var createPath = exports.createPath = function(path) {
	var dirs = path.split('/'),
		path = '.';

	dirs.pop(); // remove a file name or an empty element from the end

	dirs.forEach(function(dir) {
		path = path + '/' + dir;
		if (!fs.existsSync(path)) {
			fs.mkdirSync(path);
		}
	});

	return true;
};

/**
 * Formats the number.
 *
 * @param {Number} num Number to be formatted.
 * @param {Number} decimals[optional] How many decimal points. Default: 2.
 * @param {String} decimalPoint[optional] Decimal point. Default: '.'.
 * @param {String} thousandsSeparator[optional] Thousands separator. Default: ','.
 * @return {String}
 */
var formatNumber = exports.formatNumber = function(num, decimals, decimalPoint, thousandsSeparator) {
	decimals = (decimals === undefined) ? 2 : decimals;
	decimalPoint = decimalPoint || '.';
	thousandsSeparator = thousandsSeparator || ',';

	// strip all characters but numerical ones
	num = num.toString().replace(/[^0-9+\-Ee.]/g, '');

	var n = !isFinite(+num) ? 0 : +num,
		prec = !isFinite(+decimals) ? 0 : Math.abs(decimals),
		str = '',

		toFixedFix = function(n, prec) {
			var k = Math.pow(10, prec);
			return '' + Math.round(n * k) / k;
		};

	// Fix for IE parseFloat(0.55).toFixed(0) = 0;
	str = (prec ? toFixedFix(n, prec) : '' + Math.round(n)).split('.');

	if (str[0].length > 3) {
		str[0] = str[0].replace(/\B(?=(?:\d{3})+(?!\d))/g, thousandsSeparator);
	}
	
	if ((str[1] || '').length < prec) {
		str[1] = str[1] || '';
		str[1] += new Array(prec - str[1].length + 1).join('0');
	}
	return str.join(decimalPoint);
}

/**
 * Changes the given bytes to a user friendly string.
 *
 * @param  {Number} bytes  Bytes to be converted.
 * @param  {Number} decimals[optional] Number of decimals to be shown. Default: 2.
 * @return {String}
 */
exports.bytesToString = function(bytes, decimals) {
	decimals = (typeof decimals === 'undefined') ? 2 : decimals;

	if (bytes < 1024) {
		return bytes + ' b';
	}

	var kilobytes = bytes / 1024;
	if (kilobytes <= 1024) {
		return formatNumber(kilobytes, decimals) + ' kb';
	}

	var megabytes = kilobytes / 1024;
	return formatNumber(megabytes, decimals) + ' MB';
};