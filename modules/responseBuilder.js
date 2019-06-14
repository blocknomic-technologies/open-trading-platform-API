/**
 * @overview A module for responsding to various events and erros.
 * @author Blocknomic Technologies
 * @license https://desktop.github.com/eula/
 * @version 0.6.9
 */
/**
 * A class handling all the response related functions.
 * @module ResponseBuilder
 */
class ResponseBuilder {

    /**
     * Creates an instance of ResponseBuilder.
     * @constructor
     * @memberof ResponseBuilder
     */
    constructor() {
        this.defaultHeaders = {};
    }

    /**
     * A function to respond to various functions
     * @param {*} statusCode
     * @param {*} status
     * @param {*} req
     * @param {*} res
     * @param {*} data
     * @param {*} headers
     * @param {*} message
     * @returns [{Object}] Status of the response with message and data
     * @memberof ResponseBuilder
     */
    sendResponse(statusCode, status, req, res, data, headers, message) {
        res.options.code = statusCode;
        let originalHeaders = res.options.headers || {};
        res.options.headers = Object.assign({},
            originalHeaders,
            headers || {},
            this.defaultHeaders
        );
        return res.json({
            status: (status == null || status) ? true : false,
            message,
            data
        });
    }

    /**
     * A function to respond to validation errors.
     * @param {*} validationErrors
     * @param {*} req
     * @param {*} res
     * @returns [{Object}] Error status code with message
     * @memberof ResponseBuilder
     */
    sendValidationErrorsResponse(validationErrors, req, res) {
        return this.sendResponse(
            200,
            false,
            req,
            res, { errors: validationErrors }, {},
            "Some Validation Errors Occured"
        );
    }

    /**
     * A function to respond to Internal Server errors
     * @param {*} req
     * @param {*} res
     * @returns [{Object}] Error status Code with message
     * @memberof ResponseBuilder
     */
    sendInternalServerError(req, res) {
        return this.sendResponse(
            500,
            false,
            req,
            res, {}, {},
            "The server encountered some error.");
    }

    /**
     * A function to responsd to Unauthorized access of functions
     * @param {*} req
     * @param {*} res
     * @returns [{Object}] Error status Code with message
     * @memberof ResponseBuilder
     */
    sendUnauthorizedResponse(req, res) {
        return this.sendResponse(
            401,
            false,
            req,
            res, {}, {},
            "Unauthorized");
    }
}
/**
 * @exports ResponseBuilder
 */
module.exports = new ResponseBuilder();