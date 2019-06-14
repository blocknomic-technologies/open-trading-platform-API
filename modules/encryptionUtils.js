/**
 * @overview A module to encrypt and decrypt for password, username, email address.
 * @author CurryCoins
 * @license
 * @version 0.6.9
 */
/**
 * @requires crypto
 */
'use strict';

const crypto = require("crypto");
/**
 * An object of IV with respect to which the data is encrypted.
 * @constant commonIvs
 * @type {Object}
 * @default
 */
const commonIvs = {
    email: '0e8e33c1aab738a8b3db79d06f9c57f76aca62a08dead21ab776499dafd89c5d13c07c56b0fc0e474cd09de09b39a23d11f1060b638868ba2ec6c5b8caedf40d',
    userName: '9cc807f0606baf2963f253e8d11b4e5440f6e4ff6fd775d512763df124b48a6da52afabc7f715b760e71a78855d13b439c4a4f41aebcd0420949e82c242ef365',
    password: '0c2ec8ad6f8f814f6ddf8a56dcad9e7a6350e640231951113ca5fa180e6141ffbe9424bb7fcde6fab848b01c56f6e0fb429105d5f92627d7a85d39d10562daa6',
}

/**
 * Algorithm used for encryption
 * @constant
 * @type {String}
 * @default
 */
const algorithm = "aes-256-gcm";
const algorithm2 = "aes-256-cfb";
/**
 * @constant
 * @type {String}
 * @default
 */
const password = '3zTvzr3p67VC61jmV54rIYu1545x4TlY';
/**
 * MQTT Password
 * @constant
 * @type {string}
 * @default
 */
const mqtt_password = 'CTWEA44zMHqCMLRHPJEPvqZjQbBCxMAO';
/**
 * Seperator for 2 keys
 * @constant
 * @type {string}
 * @default
 */
const seperator = '__';
/**
 * A function to encrypt the data
 * @param {string} text - Data to be encrypted
 * @param {string} iv - Key used for encryption
 * @returns [{string}] Encrypted text
 */
function encrypt(text, iv) {
    if (!text) {
        return '';
    }
    var cipher = crypto.createCipheriv(algorithm, password, Buffer.from(iv, 'hex'));
    var encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    var tag = cipher.getAuthTag();
    return `${encrypted}${seperator}${tag.toString('hex')}`
}

/**
 * A function to fetch MQTT tokens
 * @param {string} text - user name
 * @param {string} iv - Initialization vector
 * @return {string} Encrypted text
 */
function get_mqtt_token(text, iv) {
    if (!text) {
        return '';
    }
    var cipher = crypto.createCipheriv(algorithm, mqtt_password, Buffer.from(iv, 'hex'));
    var encrypted = cipher.update(text, 'utf8', 'hex');
    return encrypted += cipher.final('hex');
    // var tag = cipher.getAuthTag();
    // `${encrypted}${seperator}${tag.toString('hex')}`
}
/**
 * A function to decrypt the data
 * @param {string} encrypted - Data to be decrypted
 * @param {number} iv - Key used for encryption
 * @returns [{string}] Decrypted text
 */
function decrypt(encrypted, iv) {
    if (!(encrypted || '').split(seperator)[1]) {
        return '';
    }
    const content = encrypted.split(seperator)[0];
    const tag = Buffer.from(encrypted.split(seperator)[1], 'hex');
    var decipher = crypto.createDecipheriv(algorithm, password, Buffer.from(iv, 'hex'));
    decipher.setAuthTag(tag);
    var dec = decipher.update(content, 'hex', 'utf8');
    dec += decipher.final('utf8');
    return dec;
}
/**
 * A function to generate IV key.
 * @return [{string}] IV key
 */
function generateIv() {
    return require('crypto').randomBytes(64).toString('hex');
}
/**
 * A function to encrypt user's email
 * @param {string} email - Email to be encrypted
 * @returns [{string}] Encrypted text
 */
function encryptEmail(email) {
    email = email.toLowerCase();
    var cipher = crypto.createCipheriv(algorithm, password, commonIvs.email);
    var encrypted = cipher.update(email, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    var tag = cipher.getAuthTag();
    return `${encrypted}${seperator}${tag.toString('hex')}`
}
/**
 * A function to decrypt user's email
 * @param {string} encrypted - Encrypted email
 * @returns [{string}] decrypted text
 */
function decryptEmail(encrypted) {
    const content = encrypted.split(seperator)[0];
    const tag = Buffer.from(encrypted.split(seperator)[1], 'hex');
    var decipher = crypto.createDecipheriv(algorithm, password, commonIvs.email);
    decipher.setAuthTag(tag);
    var dec = decipher.update(content, 'hex', 'utf8');
    dec += decipher.final('utf8');
    return dec;
}

/**
 * A function to encrypt user's Secret Access Key
 * @param {string} secretKey - Secret Access Key to be encrypted
 * @returns [{string}] Encrypted text
 */
/**
 * A function to decrypt user's Secret Access Key
 * @param {string} text - Encrypted Secret Access Key
 * @returns [{string}] decrypted text
 */

/**
 * A function to encrypt username.
 * @param {string} userName - User name
 * @returns [{string}] encrypted text
 */
function encryptUsername(userName) {
    userName = userName.toLowerCase();
    var cipher = crypto.createCipheriv(algorithm, password, commonIvs.userName);
    var encrypted = cipher.update(userName, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    var tag = cipher.getAuthTag();
    return `${encrypted}${seperator}${tag.toString('hex')}`
}
/**
 * A function to decrypt username
 * @param {string} encrypted - Encrypted username
 * @returns [{string}] decrypted text
 */
function decryptUsername(encrypted) {
    const content = encrypted.split(seperator)[0];
    const tag = Buffer.from(encrypted.split(seperator)[1], 'hex');
    var decipher = crypto.createDecipheriv(algorithm, password, commonIvs.userName);
    decipher.setAuthTag(tag);
    var dec = decipher.update(content, 'hex', 'utf8');
    dec += decipher.final('utf8');
    return dec;
}
/**
 * A function to encrypt user password
 * @param {string} passwordText - Password to be encrypted
 * @returns [{string}] encrypted text
 */
function encryptPassword(passwordText) {
    var cipher = crypto.createCipheriv(algorithm, password, commonIvs.password);
    var encrypted = cipher.update(passwordText, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return `${encrypted}`;
}
/**
 * A function to generate random string
 * @param {number} [length = 10] - Length of the string to be generated.
 * @returns [{string}] a random string
 */
function generateRandomString(length = 10) {
    return crypto.randomBytes(100).toString('hex').substring(0, length - 1);
}

/**
 * @exports encrypt
 * @exports decrypt
 * @exports generateIv
 * @exports encryptUsername
 * @exports decryptUsername
 * @exports encryptEmail
 * @exports decryptEmail
 * @exports encryptPassword  
 * @exports generateRandomString
 * @exports get_mqtt_token
 */
module.exports = {
    encrypt,
    decrypt,
    generateIv,
    encryptUsername,
    decryptUsername,
    encryptEmail,
    decryptEmail,
    encryptPassword,
    generateRandomString,
    get_mqtt_token,
};