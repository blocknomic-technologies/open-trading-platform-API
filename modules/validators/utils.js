/**
 * @overview A module for regex matching
 * @author Blocknomic Technologies
 * @license https://desktop.github.com/eula/
 * @version 0.6.9
 */
/**
 * A class encapsulating all functions for Regex matching
 * @module ValidatorUtils
 */
class ValidatorUtils {

    /**
     * Creates an instance of ValidatorUtils.
     * Contains all regex initalizations
     * @memberof ValidatorUtils
     */
    constructor() {
        this.regex = {
            email: /^[a-zA-Z0-9-_.+]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
            url: /^(https?:\/\/(?:www\.|(?!www))[^\s.#!:?+=&@!$'~*,;\/()[\]]+\.[^\s#!?+=&@!$'~*,;()[\]\\]{2,}\/?|www\.[^\s#!:.?+=&@!$'~*,;\/()[\]]+\.[^\s#!?+=&@!$'~*,;()[\]\\]{2,}\/?)/i,
            phone: /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/im,
            zip: /^\d{5}(?:[-\s]\d{4})?$/,
            uid: /^\d{14,}[a-z]{3}[01]{1}$/
        }
    }

    /**
     * A function to validate User's email
     * @param {string} [email='']
     * @returns [{Boolean}] Valid then True else False
     * @memberof ValidatorUtils
     */
    isValidEmail(email = '') {
        return email.match(this.regex.email) !== null;
    }

    /**
     * A function to validate URL
     * @param {string} [url='']
     * @returns [{Boolean}] Valid then True else False
     * @memberof ValidatorUtils
     */
    isValidUrl(url = '') {
        return url.match(this.regex.url) !== null;
    }

    /**
     * A function to validate User ID
     * @param {string} [uid=''] - User ID
     * @returns [{Boolean}] Valid then True else False
     * @memberof ValidatorUtils
     */
    isValidUid(uid = '') {
        return uid.match(this.regex.uid) !== null;
    }
}
/**
 * @exports ValidatorUtils
 */
module.exports = new ValidatorUtils();