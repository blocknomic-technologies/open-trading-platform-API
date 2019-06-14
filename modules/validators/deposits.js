/**
 * @overview A module for validation of requests to generate a crypto wallet.
 * @author Blocknomic Technologies
 * @license https://desktop.github.com/eula/
 * @version 0.6.9
 */
/**
 * @module wallets
 */
let walletModel = MODEL("wallets");

/**
 * A function to validate user's request to generate crypto wallet
 * @param {Object} requestBody -  Object with Currnecy Symbol.
 * @param {string} username - Username
 * @returns [{Object}] Validation Error
 */
async function validateCryptoWalletGeneration(requestBody, username) {
  let validationErrors = [];
  let supportedCoins = ["btc", "bch", "ltc", "eth",'xmr'];
  if (supportedCoins.indexOf(requestBody.coin) === -1) {
    validationErrors.push("Coin not supported");
  } else if (
    await walletModel.doesUserWalletExist(requestBody.coin, username)
  ) {
    validationErrors.push("Wallet already exists");
  }
  return validationErrors;
}
/**
 * @exports validateCryptoWalletGeneration
 */
module.exports = {
    validateCryptoWalletGeneration,

};