const request = require('request-promise')
const crypto = require('crypto')
const axios = require('axios');
const keys = require("../keys.js");

class bitfinex_walletTransferBalance {

    async getApiKeys() {
        let apiKey = "";
        let apiSecret = "";
        apiKey = keys.keys.bitfinexAPI;
        apiSecret = keys.keys.bitfinexSecret;
        return {
            apiKey,
            apiSecret
        };
    }
    async tradingHistory() {
        let apiObj = {};
        apiObj = await this.getApiKeys();
        const apiPath = 'v2/auth/r/trades/hist';
        const nonce = (Date.now() * Date.now() * 5812).toString();
        const body = {};
        let signature = `/api/${apiPath}${nonce}${JSON.stringify(body)}`;

        const sig = crypto.createHmac('sha384', apiObj.apiSecret).update(signature);
        const shex = sig.digest('hex');

        const options = {
            url: `https://api.bitfinex.com/${apiPath}`,
            headers: {
                'bfx-nonce': nonce,
                'bfx-apikey': apiObj.apiKey,
                'bfx-signature': shex
            },
            method: 'post',
            body: body,
            json: true
        }
        return (request(options).then(function(response) {
            return response;
        }).catch(function(err) {
            return err;
        }));
    }

    async transactionHistory() {
        let apiObj = {};
        apiObj = await this.getApiKeys();
        const apiPath = 'v2/auth/r/movements/hist'
        const nonce = (Date.now() * Date.now() * 5812).toString();
        const body = {}
        let signature = `/api/${apiPath}${nonce}${JSON.stringify(body)}`

        const sig = crypto.createHmac('sha384', apiObj.apiSecret).update(signature)
        const shex = sig.digest('hex')

        const options = {
            url: `https://api.bitfinex.com/${apiPath}`,
            headers: {
                'bfx-nonce': nonce,
                'bfx-apikey': apiObj.apiKey,
                'bfx-signature': shex
            },
            method: 'post',
            body: body,
            json: true
        }
        return (request(options).then(function(response) {
            return response;
        }).catch(function(err) {
            return err;
        }));
    }

    async processAllTransfers(databody) {
        let apiObj = {};
        apiObj = await this.getApiKeys();

        const baseUrl = 'https://api.bitfinex.com';

        const url = '/v1/transfer';
        const completeURL = baseUrl + url;
        const nonce = (Date.now() * 1.235).toString();
        var body = {
            "request": url,
            "amount": databody.amount,
            "currency": databody.currency,
            "walletfrom": databody.walletfrom,
            "walletto": databody.walletto,
            "nonce": nonce
        };


        const payload = new Buffer(JSON.stringify(body))
            .toString('base64');

        const signature = crypto
            .createHmac('sha384', apiObj.apiSecret)
            .update(payload)
            .digest('hex');

        const options = {
            method: 'post',
            url: completeURL,
            headers: {
                'X-BFX-APIKEY': apiObj.apiKey,
                'X-BFX-PAYLOAD': payload,
                'X-BFX-SIGNATURE': signature
            },
            body: JSON.stringify(body)
        };

        return (await axios(options)).data;

    }

    async fetchDepositAddress(method) {
        let apiObj = {};
        apiObj = await this.getApiKeys();
        const baseUrl = 'https://api.bitfinex.com';
        const url = '/v1/deposit/new'
        const nonce = (Date.now() * 1.235).toString();
        const completeURL = baseUrl + url
            // const body = {
            //     request: url,
            //     nonce
            // }

        var body = {
            "request": url,
            "nonce": nonce,
            "method": method,
            "wallet_name": "exchange",
            "renew": 0
        }


        const payload = new Buffer(JSON.stringify(body))
            .toString('base64')

        const signature = crypto
            .createHmac('sha384', apiObj.apiSecret)
            .update(payload)
            .digest('hex')

        const options = {
            url: completeURL,
            headers: {
                'X-BFX-APIKEY': apiObj.apiKey,
                'X-BFX-PAYLOAD': payload,
                'X-BFX-SIGNATURE': signature
            },
            body: JSON.stringify(body)
        }

        return (await axios(options)).data;

    }
    async bitfinexWalletBalance() {
        let apiObj = {};
        apiObj = await this.getApiKeys();
        const apiPath = 'v2/auth/r/wallets'
        const nonce = (Date.now() * Date.now() * 5812).toString();
        const body = {}
        let signature = `/api/${apiPath}${nonce}${JSON.stringify(body)}`

        const sig = crypto.createHmac('sha384', apiObj.apiSecret).update(signature)
        const shex = sig.digest('hex')

        const options = {
            url: `https://api.bitfinex.com/${apiPath}`,
            headers: {
                'bfx-nonce': nonce,
                'bfx-apikey': apiObj.apiKey,
                'bfx-signature': shex
            },
            method: 'post',
            body: body,
            json: true
        }
        return (request(options).then(function(response) {
            return response;
        }).catch(function(err) {
            return err;
        }));
    }

    async bitfinexAPIWalletBalance() {
        let apiObj = {};
        apiObj = await this.getApiKeys();
        const apiPath = 'v2/auth/r/wallets'
        const nonce = (Date.now() * Date.now() * 5812).toString();
        const body = {}
        let signature = `/api/${apiPath}${nonce}${JSON.stringify(body)}`

        const sig = crypto.createHmac('sha384', apiObj.apiSecret).update(signature)
        const shex = sig.digest('hex')

        const options = {
            url: `https://api.bitfinex.com/${apiPath}`,
            headers: {
                'bfx-nonce': nonce,
                'bfx-apikey': apiObj.apiKey,
                'bfx-signature': shex
            },
            method: 'post',
            body: body,
            json: true
        }
        return (request(options).then(function(response) {
            return response;
        }).catch(function(err) {
            return err;
        }));
    }

    async orders(symbol = '') {
        let apiObj = {};
        apiObj = await this.getApiKeys();
        const apiPath = `v2/auth/r/orders/${symbol}`;
        const nonce = (Date.now() * Date.now() * 5812).toString();
        const body = {}
        let signature = `/api/${apiPath}${nonce}${JSON.stringify(body)}`

        const sig = crypto.createHmac('sha384', apiObj.apiSecret).update(signature)
        const shex = sig.digest('hex')

        const options = {
            url: `https://api.bitfinex.com/${apiPath}`,
            headers: {
                'bfx-nonce': nonce,
                'bfx-apikey': apiObj.apiKey,
                'bfx-signature': shex
            },
            method: 'post',
            body: body,
            json: true
        }
        return (request(options).then(function(response) {
            return response.map((ele) => {
                let bos = 'buy';
                if (ele[6] < 0) {
                    bos = 'sell'
                }
                return {
                    cid: ele[2],
                    pair: ele[3],
                    timestamp: new Date(ele[4]).toLocaleString(),
                    amount: Math.abs(ele[6]),
                    orderType: ele[8],
                    exchange: 'bitfinex',
                    price: ele[16],
                    stopPrice: ele[19],
                    flags: ele[12],
                    params: `Average Price: ${ele[17]}, Trailing Price: ${ele[18]}`,
                    bos: bos,
                    status: ele[13]
                }
            });
        }).catch(function(err) {
            return [];
        }));
    }

    async positions() {
        let apiObj = {};
        apiObj = await this.getApiKeys();
        const apiPath = `v2/auth/r/positions`;
        const nonce = (Date.now() * Date.now() * 5812).toString();
        const body = {}
        let signature = `/api/${apiPath}${nonce}${JSON.stringify(body)}`

        const sig = crypto.createHmac('sha384', apiObj.apiSecret).update(signature)
        const shex = sig.digest('hex')

        const options = {
            url: `https://api.bitfinex.com/${apiPath}`,
            headers: {
                'bfx-nonce': nonce,
                'bfx-apikey': apiObj.apiKey,
                'bfx-signature': shex
            },
            method: 'post',
            body: body,
            json: true
        }
        return (request(options).then(function(response) {
            return response.map((ele) => {
                return {
                    symbol: ele[0],
                    status: ele[1],
                    amount: ele[2],
                    basePrice: ele[3],
                    marginFunding: ele[4],
                    marginFundingType: ele[5],
                    profitLoss: ele[6],
                    plPercentage: ele[7],
                    liquidationPrice: ele[8],
                    leverage: ele[9],
                    exchange: 'Bitfinex'
                }
            });
        }).catch(function(err) {
            return err;
        }));
    }

    async ordersHistory() {
        let apiObj = {};
        apiObj = await this.getApiKeys();
        const apiPath = 'v2/auth/r/orders/hist'
        const nonce = (Date.now() * Date.now() * 5812).toString();
        const body = {}
        let signature = `/api/${apiPath}${nonce}${JSON.stringify(body)}`

        const sig = crypto.createHmac('sha384', apiObj.apiSecret).update(signature)
        const shex = sig.digest('hex')

        const options = {
            url: `https://api.bitfinex.com/${apiPath}`,
            headers: {
                'bfx-nonce': nonce,
                'bfx-apikey': apiObj.apiKey,
                'bfx-signature': shex
            },
            method: 'post',
            body: body,
            json: true
        }
        return (request(options).then(function(response) {
            return response;
        }).catch(function(err) {
            return err;
        }));
    }

    async positionsHistory() {
        let apiObj = {};
        apiObj = await this.getApiKeys();
        const apiPath = 'v2/auth/r/positions/hist'
        const nonce = (Date.now() * Date.now() * 5812).toString();
        const body = {}
        let signature = `/api/${apiPath}${nonce}${JSON.stringify(body)}`

        const sig = crypto.createHmac('sha384', apiObj.apiSecret).update(signature)
        const shex = sig.digest('hex')

        const options = {
            url: `https://api.bitfinex.com/${apiPath}`,
            headers: {
                'bfx-nonce': nonce,
                'bfx-apikey': apiObj.apiKey,
                'bfx-signature': shex
            },
            method: 'post',
            body: body,
            json: true
        }
        return (request(options).then(function(response) {
            return response;
        }).catch(function(err) {
            return err;
        }));
    }

    async refresh_wallet_balance(username) {
        await this.bitfinexWalletBalance(username);
    }

    async marginsInfo(key = 'base') {

        let apiObj = {};
        apiObj = await this.getApiKeys();
        const apiPath = `v2/auth/r/info/margin/${key}`;
        const nonce = (Date.now() * Date.now() * 5812).toString();
        const body = {}
        let signature = `/api/${apiPath}${nonce}${JSON.stringify(body)}`

        const sig = crypto.createHmac('sha384', apiObj.apiSecret).update(signature)
        const shex = sig.digest('hex')

        const options = {
            url: `https://api.bitfinex.com/${apiPath}`,
            headers: {
                'bfx-nonce': nonce,
                'bfx-apikey': apiObj.apiKey,
                'bfx-signature': shex
            },
            method: 'post',
            body: body,
            json: true
        }
        return (await request(options).then(function(response) {
            if (key !== 'base') {
                return {
                    symbol: response[1],
                    tradeable_balance: response[2][0],
                    gross_balance: response[2][1],
                }
            } else {
                return {
                    user_pl: response[1][0],
                    user_swaps: response[1][1],
                    margin_balance: response[1][2],
                    margin_net: response[1][3],
                    margin_required: response[1][4],
                }
            }
        }).catch(function(err) {
            return err;
        }));
    }

    async pairWiseBalance(pairArr) {
        let balances = await this.bitfinexWalletBalance();
        let array = [];
        balances.forEach((ele) => {
            if (ele[1] === pairArr[0] || ele[1] === pairArr[1]) {
                let obj = {
                    wallet_type: ele[0],
                    currency: ele[1],
                    total_bal: ele[2],
                    locked_bal: ele[3],
                    avail_bal: Number(ele[2]) - Number(ele[3])
                };
                array.push(obj);
            }
        });
        return array;
    }

    async getCurrentPrice(pair) {
        let prices = (await axios.get(`https://api-pub.bitfinex.com/v2/ticker/${pair}`)).data;
        return {
            buy: prices[2],
            sell: prices[0]
        }
    }
}

module.exports = new bitfinex_walletTransferBalance();