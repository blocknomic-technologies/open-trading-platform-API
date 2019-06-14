/**
 * @overview A module for decryption of data - Username, email and password.
 * @author CurryCoins
 * @license
 * @version 0.6.9
 */
/**
 * @requires crypto
 */
var crypto = require('crypto');

/**
 * A class containing all functions required for decryption of the data.
 * @module Decrypt
 */
class Decrypt {
    /**
     * Empty Constructor
     * @constructor
     */
    constructor() {}
        /**
         * A function to decrypt Base64 string.
         * @param {string} [str = ''] - Base64 String
         * @returns Decoded Base64 string
         */
    base64(str = '') {
            return Buffer.from(str, 'base64')
        }
        /**
         * Decryption of the data through aes algorithm.
         * @param {string} [data = ''] - Data to be decrypted
         * @param {string} [encKey = ''] - Encryption key
         * @param {string} [iv = ''] - IV key corresponding to the data
         * @returns [{string}] Decrypted key
         */
    aes(data = '', encKey = '', iv = '') {
            let cipher = crypto.createDecipheriv("aes-128-cbc", encKey, iv);
            cipher.setAutoPadding(true);
            return Buffer.concat([cipher.update(data), cipher.final()])
        }
        /**
         * A function to decode the string using AES-256-CTR algorithm
         * @param {string} text - Text to be decoded
         * @param {string} password - Encryption key
         * @return [{string}] Decrypted text
         */
    aes256(text, password) {
        let decipher = crypto.createDecipher('aes-256-ctr', password)
        let dec = decipher.update(text, 'hex', 'utf8')
        dec += decipher.final('utf8');
        return dec;
    }
}
/**
 * @exports Decrypt
 */
module.exports = new Decrypt();