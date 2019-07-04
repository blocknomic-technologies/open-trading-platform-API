/**
 * @overview A module for encryption of the data.
 * @author CurryCoins
 * @license
 * @version 0.6.9
 */
/**
 * @requires crypto
 */
var crypto = require('crypto');
/**
 * This class defines all the functions to encrypt the data.
 * @module Encrypt
 */
class Encrypt {
    /**
     * Empty constructor
     * @constructor
     */
    constructor() {}
        /**
         * A function to encrypt the data with SHA-512 encryption technique.
         * @param {string} data - Data to be encrypted
         * @returns SHA-512 hash of the data
         */
    sha512(data) {
            return crypto.createHash('sha512').update(data).digest('hex');
        }
        /**
         * A function to encrypt the base64 string
         * @param {string} [str = ''] - Base64 string
         * @returns [{String}] Encoded base64 string
         */
    base64(str = '') {
            return Buffer.from(str).toString('base64')
        }
        /**
         * A function to encode the string using AES-128-CBC algorithm
         * @param {string} [data = ''] - Data to be encrypted
         * @param {string} [encKey = ''] - Encryption Key
         * @param {string} [iv = ''] - IV key corresponding to the data.
         * @returns [{Buffer}] Encrypted data
         */
    aes(data = '', encKey = '', iv = '') {
            let cipher = crypto.createCipheriv("aes-128-cbc", encKey, iv);
            cipher.setAutoPadding(true);
            return Buffer.concat([cipher.update(data), cipher.final()])
        }
        /**
         * A function to generate 16 byte Intilization vector for AES128.
         * @returns [{Buffer}] Generated IV.
         */
    generateAes128iv() {
            return crypto.randomBytes(16)
        }
        /**
         * A function to encode the string using AES-256-CTR algorithm
         * @param {string} text - Text to be encoded
         * @param {string} password - Encryption key
         * @return [{Object}] Encrypted text
         */
    aes256(text, password) {
        let cipher = crypto.createCipher('aes-256-ctr', password)
        let crypted = cipher.update(text, 'utf8', 'hex')
        crypted += cipher.final('hex');
        return crypted;
    }
}
/**
 * @exports Encrypt
 */
module.exports = new Encrypt();