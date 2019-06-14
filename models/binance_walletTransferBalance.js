const request = require('request-promise')
const crypto = require('crypto')
const axios = require('axios');
const keys = require("../keys.js");

class binance_walletTransferBalance {
    async getApiKeys() {
        let apiKey = "";
        let apiSecret = "";
        apiKey = keys.keys.binanceAPI;
        apiSecret = keys.keys.binanceSecret;
        return {
            apiKey,
            apiSecret
        };
    }

    async withdrawalHistory() {
        let apiObj = {};
        apiObj = await this.getApiKeys();
        var apiSecret = apiObj.apiSecret;

        var headers = {
            'X-MBX-APIKEY': apiObj.apiKey,
        };
        var cryptKey = `timestamp=${Date.now()}`
        const sig = crypto.createHmac('sha256', apiSecret).update(cryptKey)
        const shex = sig.digest('hex')

        var options = {
            url: `https://www.binance.com/wapi/v3/withdrawHistory.html?${cryptKey}&signature=${shex}`,
            method: 'GET',
            headers: headers
        };

        return (request(options).then(function(response) {
            return response;
        }).catch(function(err) {
            return err;
        }));
    }


    async depositHistory() {
        let apiObj = {};
        apiObj = await this.getApiKeys();
        var apiSecret = apiObj.apiSecret;

        var headers = {
            'X-MBX-APIKEY': apiObj.apiKey,
        };
        var cryptKey = `timestamp=${Date.now()}`
        const sig = crypto.createHmac('sha256', apiSecret).update(cryptKey)
        const shex = sig.digest('hex')

        var options = {
            url: `https://www.binance.com/wapi/v3/depositHistory.html?${cryptKey}&signature=${shex}`,
            method: 'GET',
            headers: headers
        };

        return (request(options).then(function(response) {
            return response;
        }).catch(function(err) {
            return err;
        }));
    }



    async fetchDepositAddress(method) {
        let apiObj = {};
        apiObj = await this.getApiKeys();
        var apiSecret = apiObj.apiSecret;

        var headers = {
            'X-MBX-APIKEY': apiObj.apiKey,
        };
        var cryptKey = `asset=${method}&timestamp=${Date.now()}`
        const sig = crypto.createHmac('sha256', apiSecret).update(cryptKey)
        const shex = sig.digest('hex')

        var options = {
            url: `https://www.binance.com/wapi/v3/depositAddress.html?${cryptKey}&signature=${shex}`,
            method: 'GET',
            headers: headers
        };

        return (request(options).then(function(response) {
            return response;
        }).catch(function(err) {
            return err;
        }));
    }


    async tradingHistory(symbol) {
        let apiObj = {};
        apiObj = await this.getApiKeys();
        var apiSecret = apiObj.apiSecret;

        var headers = {
            'X-MBX-APIKEY': apiObj.apiKey,
        };
        var cryptKey = `symbol=${symbol}&timestamp=${Date.now()}`
        const sig = crypto.createHmac('sha256', apiSecret).update(cryptKey)
        const shex = sig.digest('hex')

        var options = {
            url: `https://www.binance.com/api/v3/myTrades?${cryptKey}&signature=${shex}`,
            method: 'GET',
            headers: headers
        };

        return (request(options).then(function(response) {
            return response;
        }).catch(function(err) {
            return err;
        }));
    }

    async ordersHistory() {
        let apiObj = {};
        apiObj = await this.getApiKeys();
        var apiSecret = apiObj.apiSecret;

        var headers = {
            'X-MBX-APIKEY': apiObj.apiKey,
        };
        var cryptKey = `symbol=${symbol}&timestamp=${Date.now()}`
        const sig = crypto.createHmac('sha256', apiSecret).update(cryptKey)
        const shex = sig.digest('hex')

        var options = {
            url: `https://www.binance.com/api/v3/allOrders?${cryptKey}&signature=${shex}`,
            method: 'GET',
            headers: headers
        };

        return (request(options).then(function(response) {
            return response;
        }).catch(function(err) {
            return err;
        }));
    }
    async binanceAPIBalanceFetch() {
        let apiObj = {};
        apiObj = await this.getApiKeys();
        var apiSecret = apiObj.apiSecret;

        var headers = {
            'X-MBX-APIKEY': apiObj.apiKey,
        };
        var cryptKey = `timestamp=${Date.now()}`
        const sig = crypto.createHmac('sha256', apiSecret).update(cryptKey)
        const shex = sig.digest('hex')

        var options = {
            url: `https://www.binance.com/api/v3/account?${cryptKey}&signature=${shex}`,
            method: 'GET',
            headers: headers
        };

        return (request(options).then(function(response) {
            return JSON.parse(response).balances;
        }).catch(function(err) {
            return err;
        }));
    }
    async binanceWalletBalance() {
        let apiObj = {};
        apiObj = await this.getApiKeys();
        var apiSecret = apiObj.apiSecret;

        var headers = {
            'X-MBX-APIKEY': apiObj.apiKey,
        };
        var cryptKey = `timestamp=${Date.now()}`
        const sig = crypto.createHmac('sha256', apiSecret).update(cryptKey)
        const shex = sig.digest('hex')

        var options = {
            url: `https://www.binance.com/api/v3/account?${cryptKey}&signature=${shex}`,
            method: 'GET',
            headers: headers
        };

        return (request(options).then(function(response) {
            return response;
        }).catch(function(err) {
            return err;
        }));
    }

    async refresh_wallet_balance() {}

    async getPairWiseBalance(pair) {
        let balances = JSON.parse(await this.binanceWalletBalance()).balances;
        let array = [];
        balances.forEach((ele) => {
            if (ele.asset === pair[0] || ele.asset === pair[1]) {
                let obj = {
                    wallet_type: 'exchange',
                    currency: ele.asset,
                    total_bal: ele.free + ele.locked,
                    locked_bal: ele.locked,
                    avail_bal: ele.free
                };
                array.push(obj);
            }
        });
        return array;
    }

    async getCurrentPrice(pair) {
        let prices = (await axios.get(` https://api.binance.com/api/v3/ticker/bookTicker?symbol=${pair}`)).data;
        return {
            buy: prices.askPrice,
            sell: prices.bidPrice
        }

    }

}

module.exports = new binance_walletTransferBalance();