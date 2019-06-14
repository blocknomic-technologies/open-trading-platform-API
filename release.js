// ===================================================

// IMPORTANT: only for production

// total.js - web application framework for node.js

// http://www.totaljs.co m

// ===================================================



var fs = require('fs');

var options = {};

options.ip = 'localhost';

options.port = '9001';

require('total.js').http('release', options);