const request = require('request-promise')
const crypto = require('crypto')
const axios = require('axios');
const keys = require("../keys.js");

class bequant_walletTransferBalance {
    async getApiKeys() {
        let apiKey = "";
        let apiSecret = "";
        apiKey = keys.keys.bequantAPI;
        apiSecret = keys.keys.bequantSecret;
        return {
            apiKey,
            apiSecret
        };
    }

    async tradingHistory() {
        let apiObj = {};
        apiObj = await this.getApiKeys();
        var options = {
            url: 'https://api.bequant.io/api/2/history/trades',
            method: 'GET',
            auth: {
                'user': apiObj.apiKey,
                'pass': apiObj.apiSecret
            },
        };

        return (request(options).then(function(response) {
            return response;
        }).catch(function(err) {
            return err;
        }));
    }

    async transactionHistory() {
        let apiObj = {};
        apiObj = await this.getApiKeys();
        var options = {
            url: 'https://api.bequant.io/api/2/account/transactions',

            auth: {
                'user': apiObj.apiKey,
                'pass': apiObj.apiSecret
            },
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
        var options = {
            url: `https://api.bequant.io/api/2/account/crypto/address/${method}`,

            auth: {
                'user': apiObj.apiKey,
                'pass': apiObj.apiSecret
            },
        };

        return (request(options).then(function(response) {
            return response;
        }).catch(function(err) {
            return err;
        }));
    }

    async processAllTransfers(databody) {
        let apiObj = {};
        apiObj = await this.getApiKeys(databody.exchange);

        var dataString = `currency=${databody.currency}&amount=${databody.amount}&type=${databody.walletto}`;

        var options = {
            url: 'https://api.bequant.io/api/2/account/transfer',
            method: 'POST',
            body: dataString,
            auth: {
                'user': apiObj.apiKey,
                'pass': apiObj.apiSecret
            }
        };

        return (request(options).then(function(response) {
            return response;
        }).catch(function(err) {
            return err;
        }));
    }

    async mainAccountBalance() {
        let apiObj = {};
        apiObj = await this.getApiKeys();
        var options = {
            url: 'https://api.bequant.io/api/2/account/balance',
            method: 'GET',
            auth: {
                'user': apiObj.apiKey,
                'pass': apiObj.apiSecret
            },
        };

        return (request(options).then(function(response) {
            return response;
        }).catch(function(err) {
            return err;
        }));
    }

    async bequantWalletBalance() {
        let apiObj = {};
        apiObj = await this.getApiKeys();
        var options = {
            url: 'https://api.bequant.io/api/2/trading/balance',
            method: 'GET',
            auth: {
                'user': apiObj.apiKey,
                'pass': apiObj.apiSecret
            },
        };

        return (request(options).then(function(response) {
            return response;
        }).catch(function(err) {
            return err;
        }));
    }

    async activeOrders(pair = '') {
        let apiObj = {};
        apiObj = await this.getApiKeys();
        var options = {
            url: `https://api.bequant.io/api/2/order?symbol=${pair}`,
            method: 'GET',
            auth: {
                'user': apiObj.apiKey,
                'pass': apiObj.apiSecret
            },
        };

        return (request(options).then(function(response) {
            return JSON.parse(response).map((ele) => {
                return {
                    cid: ele.clientOrderId,
                    pair: ele.symbol,
                    timestamp: new Date(ele.createdAt).toLocaleString(),
                    amount: ele.quantity,
                    orderType: ele.type,
                    exchange: 'bequant',
                    price: ele.price,
                    stopPrice: ele.stopPrice || '',
                    flags: `Post Only: ${ele.postOnly}`,
                    params: `Time In Force: ${ele.timeInForce}, Cum Quantity: ${ele.cumQuantity}`,
                    bos: ele.side,
                    status: ele.status
                }
            });
        }).catch(function(err) {
            return [];
        }));
    }

    async ordersHistory() {
        let apiObj = {};
        apiObj = await this.getApiKeys();
        var options = {
            url: `https://api.bequant.io/api/2/history/order`,
            method: 'GET',
            auth: {
                'user': apiObj.apiKey,
                'pass': apiObj.apiSecret
            },
        };
        return (request(options).then(function(response) {
            return response;
        }).catch(function(err) {
            return err;
        }));
    }

    async refresh_wallet_balance() {
        await this.bequantWalletBalance();
        await this.mainAccountBalance();
    }

    async getpairWiseBalance(pair) {
        let balances = JSON.parse(await this.bequantWalletBalance());
        let array = [];
        balances.forEach((ele) => {
            if (ele.currency === pair[0] || ele.currency === pair[1]) {
                let obj = {
                    wallet_type: 'exchange',
                    currency: ele.currency,
                    total_bal: Number(ele.available) + Number(ele.reserved),
                    locked_bal: ele.reserved,
                    avail_bal: ele.available
                };
                array.push(obj);
            }
        });
        return array;
    }

    async getCurrentPrice(symbol) {
        let prices = (await axios.get(`https://api.bequant.io/api/2/public/ticker/${symbol}`)).data;
        return {
            buy: prices.ask,
            sell: prices.bid
        }
    }
}
module.exports = new bequant_walletTransferBalance();