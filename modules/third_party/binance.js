/**
 * @overview A module to fetch data from Binance.
 * @author Blocknomic Technologies
 * @license https://desktop.github.com/eula/
 * @version 0.6.9
 */
/**
 * @requires axios
 */
const axios = require('axios');
/**
 * Base API URL
 * @constant
 * @type {default}
 * @default
 */
const baseApi = 'https://api.binance.com/';

class binanceModule {
    /**
     * A function to fetch Snapshots of trades and orderbook
     * @param {string} pair - Exchange Pair
     * @returns [{Object}] Trades and Depth Data
     * @memberof binanceModule
     */
    async getTradesAndDepth(pair) {
            let [responseTrades, responseDepth] = await Promise.all([
                axios.get(`${baseApi}api/v1/trades?symbol=${pair.toUpperCase()}&limit=200`),
                axios.get(`${baseApi}api/v1/depth?symbol=${pair.toUpperCase()}&limit=1000`)
            ]);
            return {
                trades: responseTrades.data,
                depth: responseDepth.data
            }
        }
        /**
         * A function to fetch snapshots of Kline data
         * @param {string} symbol - Symbol of the currency
         * @param {string} interval - Intervals in which the Kline Data is required
         * @returns [{Promise}] On resolve Snapshot else an error.
         * @memberof binanceModule
         */
    async getKlineData(symbol, interval) {
        return (await axios.get(`${baseApi}/api/v1/klines?symbol=${symbol.toUpperCase()}&interval=${interval}`)).data;
    }
}
/**
 * @exports binanceModule
 */
module.exports = new binanceModule();