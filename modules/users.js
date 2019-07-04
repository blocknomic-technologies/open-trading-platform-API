/**
 * @overview A module for handling all the user related operations.
 * @author Blocknomic Technologies
 * @license https://desktop.github.com/eula/
 * @version 0.6.9
 */

const bitfinexWallet = MODEL("bitfinex_walletTransferBalance");
const bequantWallet = MODEL("bequant_walletTransferBalance");
const binanceWallet = MODEL("binance_walletTransferBalance");
const bitmexAPIs = MODEL("authBitmexAPI");
/**
 * A class for handling all the user related operations.
 * @module Users
 */
class Users {

    async getBalancePairExchangeWise(pair, exchange, orderType, excPair) {
        exchange = exchange.toLowerCase();
        let pairArr = pair.split("/");

        switch (exchange) {
            case 'bitfinex':
                if (orderType === 'margin' || orderType === 'MARGIN') {
                    return bitfinexWallet.marginsInfo(excPair);
                } else {
                    return bitfinexWallet.pairWiseBalance(pairArr);
                }
                break;
            case 'binance':
                if (pairArr[1] === 'USD') {
                    pairArr[1] = 'USDT';
                }
                return binanceWallet.getPairWiseBalance(pairArr);
                break;
            case 'bequant':
                return bequantWallet.getpairWiseBalance(pairArr);
                break;
            case 'bitmex':
                return bitmexAPIs.getUserMargin();
                break;
        }

    }
}
/**
 * @exports Users
 */
module.exports = new Users();