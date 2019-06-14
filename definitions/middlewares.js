/**
 * @overview Sets cors and middlewares for API access.
 * @author Blocknomic Technologies
 * @license https://desktop.github.com/eula/
 * @version 0.6.9
 */
/**
 * @constant
 * @module responseBuilder
 */
const responseBuilder = MODULE('responseBuilder');
/**
 * List of origins which are allowed for API access.
 * @var allowedOrigins
 * @type {Array}
 * @default
 */
let allowedOrigins = [];
/**
 * Paths that can be accessed by anyone
 * @var publicPaths
 * @type {Array}
 * @default
 */
let publicPaths = []
    /**
     * If the environment is localhost, then allow access to all otherwise trader.currycoins.com.
     */
if (F.config.debug) {
    allowedOrigins.push("*");
} else {
    allowedOrigins.push("https://trader.blocknomic.com");
}
F.middleware('options-request',
    /**
     * Sets up cors for API
     * @param {Object} req - Requests
     * @param {Object} res - Response
     * @param {Function} callback - Callback Function
     * @returns
     */
    function(req, res, next) {
        if (req.method !== 'OPTIONS') {
            return next(true);
        }
        let origin = allowedOrigins.toString();
        if (req.uri.path === '/send-signup-email-otp-full' || req.uri.path === '/complete-signup-full') {
            origin = "https://signup.blocknomic.com";
        }
        if (req.uri.path === '/alpha/user/top' || req.uri.path === '/alpha/stats/site') {
            origin = "*";
        }
        res.options.headers = Object.assign({}, res.options.headers || {}, {
            "Access-Control-Allow-Origin": origin,
            "Access-Control-Allow-Headers": "Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With",
            "Access-Control-Allow-Methods": "POST, GET"
        });
        return responseBuilder.sendResponse(200, true, req, res, undefined, {}, "");
    });

F.middleware('content-type-check',
    /**
     * Content type should application/json
     * @param {Object} req - Requests
     * @param {Object} res - Response
     * @param {Function} callback - Callback Function
     */
    function(req, res, next) {
        if (req.headers["content-type"] !== "application/json" && req.method !== "GET" && req.method !== "OPTIONS") {
            responseBuilder.sendResponse(403, false, req, res, undefined, {}, "Access Denied");
        } else {
            next(true);
        }
    });

F.middleware('set-cors-headers',
    /**
     * Sets up cors headers
     * @param {Object} req - Requests
     * @param {Object} res - Response
     * @param {Function} callback - Callback Function
     */
    function(req, res, next) {
        let origin = allowedOrigins.toString();
        if (req.uri.path === '/send-signup-email-otp-full' || req.uri.path === '/complete-signup-full') {
            origin = "https://signup.blocknomic.com";
        }
        if (req.uri.path === '/alpha/user/top' || req.uri.path === '/alpha/stats/site') {
            origin = "*";
        }
        res.options.headers = Object.assign({}, res.options.headers || {}, {
            'Access-Control-Allow-Origin': origin,
        });
        next(true);
    });

F.middleware('origin-check',
    /**
     * Checks origin of the user
     * @param {Object} req - Requests
     * @param {Object} res - Response
     * @param {Function} callback - Callback Function
     */
    (req, res, next) => {
        if (!F.config.debug && !allowedOrigins.includes(req.headers["origin"]) && req.headers['user-agent'] !== 'ELB-HealthChecker/2.0' && !publicPaths.find(x => x === req.uri.path)) {
            return responseBuilder.sendResponse(403, false, req, res, undefined, {}, "Access Denied");
        }
        next(true);
    })
F.use("set-cors-headers", undefined, undefined, true);
F.use("origin-check", undefined, undefined);
F.use("options-request", undefined, undefined);
F.use("content-type-check");