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
      uid: /^\d{14,}[a-z]{3}[01]{1}$/,
      username: /^[a-zA-Z0-9-_.@$+]{4,16}$/,
      password: /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/,
      name: /^[a-zA-Z. -]{1,40}$/,
      referralCode: /^CC[0-9]{8,8}$/,
    };
  }
   /**
     * A function to validate URL
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
     * A function to validate URL
     * @param {string} [uid='']
     * @returns [{Boolean}] Valid then True else False
     * @memberof ValidatorUtils
     */
  isValidUid(uid = '') {
    return uid.match(this.regex.uid) !== null;
  }
   /**
     * A function to validate URL
     * @param {string} [username='']
     * @returns [{Boolean}] Valid then True else False
     * @memberof ValidatorUtils
     */
  isValidUsername(username = '') {
    return username.match(this.regex.username) !== null;
  }
   /**
     * A function to validate URL
     * @param {string} [password='']
     * @returns [{Boolean}] Valid then True else False
     * @memberof ValidatorUtils
     */
  isValidPassword(password = '') {
    return password.match(this.regex.password) !== null;
  }
   /**
     * A function to validate URL
     * @param {string} [name='']
     * @returns [{Boolean}] Valid then True else False
     * @memberof ValidatorUtils
     */
  isValidName(name = '') {
    return name.match(this.regex.name) !== null;
  }
   /**
     * A function to validate URL
     * @param {string} [zip='']
     * @returns [{Boolean}] Valid then True else False
     * @memberof ValidatorUtils
     */
  isValidZip(zip = '') {
    return zip.match(this.regex.zip) !== null;
  }
  isValidRefferalCode(code = '') {
    return code.match(this.regex.referralCode) !== null;
  }
}

/**
 * @exports ValidatorUtils
 */
module.exports = new ValidatorUtils();