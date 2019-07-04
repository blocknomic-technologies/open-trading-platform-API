const request = require('request');
const crypto = require('crypto')
const axios = require('axios');
const WebSocket = require('ws');
const MQTTService = require('../modules/mqtt');
const keys = require("../keys.js");

class authBitmexAPI {
    constructor() {
        this.ws;
        this.wsUrl = 'wss://www.bitmex.com/realtime';
        this.connectToWs();
        this.authInterval;
    }

    async connectToWs() {
        let self = this;
        this.ws = new WebSocket(this.wsUrl);
        // this.ws.on('message', (msg) => {
        //     this.handleMessage(msg, self);
        // });
        // this.ws.on('close', () => {
        //     this.handleClose(self);
        // });
        // this.ws.on('error', (err) => {
        //     this.handleError(err, self);
        // });
        this.ws.on('open', () => this.handleOpen(self));
    }

    async handleMessage(msg, self) {
        let parsedMsg = JSON.parse(msg);
        switch (parsedMsg.table) {
            case 'position':
                if (parsedMsg.action === 'update') {
                    await this.handleNotifications('info', 'positionupdate', 'pnl');
                }
                break;
            case 'order':
                if (parsedMsg.action === 'update') {
                    if (parsedMsg.data[0].text) {
                        await this.handleNotifications('Success', parsedMsg.data[0].text, 'at');
                    }
                    if (parsedMsg.data[0].ordStatus) {
                        let mesg = `Order ${parsedMsg.data[0].ordStatus} for ${parsedMsg.data[0].symbol} at ${parsedMsg.data[0].avgPx || ''}`
                        await this.handleNotifications('Success', mesg, 'at');
                    }
                }
                if (parsedMsg.action === 'insert') {
                    let message1 = '',
                        message2 = '';
                    if (parsedMsg.data[0].price) {
                        message1 = `${parsedMsg.data[0].side} ${parsedMsg.data[0].orderQty} Contract at  ${parsedMsg.data[0].price} of ${parsedMsg.data[0].symbol} ${parsedMsg.data[0].ordType}`;
                    } else {
                        message1 = `${parsedMsg.data[0].side} ${parsedMsg.data[0].orderQty} Contract at Market of ${parsedMsg.data[0].symbol} ${parsedMsg.data[0].ordType}`;

                    }
                    if (!parsedMsg.data[0].orderQty) {
                        message1 = `Order submitted to exchange`
                    }
                    if (parsedMsg.data[0].stopPx) {
                        message2 = `Trigger: Index Price @ ${parsedMsg.data[0].stopPx}`;
                    }
                    if (parsedMsg.data[0].pegOffsetValue) {
                        message2 = `Trailing Stop Offset: ${parsedMsg.data[0].pegOffsetValue} (Currently >= ${parsedMsg.data[0].stopPx}`;
                    }
                    await this.handleNotifications('Success', message1 + '\n' + message2, 'at');
                }
                break;
            case 'execution':
                break;
            case 'margin':
                await this.handleNotifications('Info', 'Margin update', 'margin');
                break;
            case 'wallet':
                await this.handleNotifications('Info', 'Balance update', 'balance');
                break;
            case 'transact':
                break;
            case 'default':
                break;
        }
    }
    async handleNotifications(flag, notifymsg, updateType) {
        await MQTTService.publishUpdates({
            type: flag,
            msg: 'Bitmex:' + notifymsg,
            updateType,
            'exchange': 'bitmex'
        });
    }

    handleClose(self) {
        clearInterval(self.authInterval);
        self.connectToWs();
    }

    handleError(err, self) {
        clearInterval(self.authInterval);
        console.log(err);
        self.connectToWs();
    }

    async handleOpen(self) {
        await self.authenticateWs();
        await self.subscribeToAuthData();
        self.authInterval = setInterval(() => {
            self.authenticateWs();
        }, 30 * 60000);
    }

    async subscribeToAuthData() {
        this.ws.send(JSON.stringify({
            "op": "subscribe",
            "args": ["execution", "order", "margin", "position", "privateNotifications", "transact", "wallet"]
        }));
    }

    async getApiKeys() {
        let apiKey = "";
        let apiSecret = "";
        apiKey = keys.keys.bitmexAPI;
        apiSecret = keys.keys.bitmexSecret;
        return {
            apiKey,
            apiSecret
        };
    }

    async authenticateWs() {
        let apiObj = await this.getApiKeys();
        let verb = 'GET',
            path = '/realtime';
        const expires = Math.round(new Date().getTime() / 1000) + (60 * 60);
        const signature = crypto.createHmac('sha256', apiObj.apiSecret).update(verb + path + expires).digest('hex');
        let payload = {
            "op": "authKeyExpires",
            "args": [apiObj.apiKey, expires, signature]
        };
        this.ws.send(JSON.stringify(payload));
    }


    async getBitmexData(method, url, data) {
        let apiObj = {};
        apiObj = await this.getApiKeys();
        let verb = method,
            path = url;
        const postBody = JSON.stringify(data);
        const expires = Math.round(new Date().getTime() / 1000) + 60;
        const signature = crypto.createHmac('sha256', apiObj.apiSecret).update(verb + path + expires + postBody).digest('hex');
        let headers = {
            'content-type': 'application/json',
            'Accept': 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
            // This example uses the 'expires' scheme. You can also use the 'nonce' scheme. See
            // https://www.bitmex.com/app/apiKeysUsage for more details.
            'api-expires': expires,
            'api-key': apiObj.apiKey,
            'api-signature': signature
        };
        const requestOptions = {
            headers: headers,
            url: 'https://www.bitmex.com' + path,
            method: verb,
            body: postBody
        };

        let response = await new Promise((resolve, reject) => {
            request(requestOptions, function(error, response, body) {
                if (error) {
                    reject(error);
                }
                resolve(body);
            })
        });
        return response;
    }

    async getBalanceFromBitmex() {
        try {
            return await this.getBitmexData('GET', '/api/v1/user/wallet', {});
        } catch (err) {
            console.log(err);
            throw err;
        }
    }
    async getOrderHistory() {
        try {
            return await this.getBitmexData('GET', '/api/v1/order', {
                reverse: true
            }, );
        } catch (err) {
            console.log(err);
            throw err;
        }
    }

    async getSwapFundingHistory() {
        try {
            return await this.getBitmexData('GET', '/api/v1/funding', {
                reverse: true
            }, );
        } catch (err) {
            console.log(err);
            throw err;
        }
    }

    async getPositionsHistory() {
        try {
            return await this.getBitmexData('GET', '/api/v1/position', {}, );
        } catch (err) {
            console.log(err);
            throw err;
        }
    }

    async getOpenPositions() {
        try {
            return await this.getBitmexData('GET', '/api/v1/position', {
                filter: {
                    "isOpen": true
                }
            }, );
        } catch (err) {
            console.log(err);
            throw err;
        }
    }
    async getOpenPositionsBYSymbol(symbol) {
        try {
            return await this.getBitmexData('GET', '/api/v1/position', {
                filter: {
                    "isOpen": true,
                    "symbol": symbol
                }
            }, );
        } catch (err) {
            console.log(err);
            throw err;
        }
    }


    async orders(data) {
        try {
            let execInst = '';
            let side = 'Sell';
            if (data.flags.trigger) {
                execInst = `${data.flags.trigger}`;
            }
            if (data.flags.reduceOnly) {
                execInst = execInst + ',ReduceOnly';
            }
            if (data.flags.postOnly) {
                execInst = execInst + ',ParticipateDoNotInitiate';
            }
            if (data.flags.closeOnTrigger) {
                execInst = execInst + ',Close';
            }

            if (data.formData.bos === 'buy') {
                side = 'Buy';
            }
            if (data.orderType === 'Stopt') {
                data.orderType = 'Stop';
            }
            let orderParams = {
                symbol: data.bnPair,
                side,
                orderQty: data.formData.amount,
                price: Number(data.formData.price),
                displayQty: data.displayQty,
                stopPx: data.formData.triggerPrice || data.formData.stopPrice,
                clOrdID: Date.now().toString(),
                ordType: data.orderType,
                timeInForce: data.tif,
                execInst,
                pegOffsetValue: data.formData.trailValue,
            };

            if (data.formData.trailValue) {
                orderParams.pegPriceType = 'TrailingStopPeg'
            }

            Object.keys(orderParams).forEach(key => !orderParams[key] ? delete orderParams[key] : '');

            return await this.getBitmexData('POST', '/api/v1/order', orderParams, )
        } catch (err) {
            console.log(err);
            throw err;
        }
    }

    async getPairList() {
        try {
            let response = await axios.get('https://www.bitmex.com/api/v1/instrument/active');
            let contracts = [];
            response.data.forEach((ele) => {
                contracts.push({
                    value: ele.symbol,
                    text: ele.symbol
                });
            });
            return contracts;
        } catch (err) {
            console.log(err);
            throw err;
        }
    }

    async setLeverage(symbol, leverage) {
        try {
            return await this.getBitmexData('POST', '/api/v1/position/leverage', {
                symbol,
                leverage
            });
        } catch (err) {
            console.log(err);
            throw err;
        }

    }

    async getOpenOrderHistory(pair) {
        try {
            let response = await this.getBitmexData('GET', '/api/v1/order', {
                reverse: true,
                filter: {
                    "open": true
                }
            }, );
            return JSON.parse(response).map((ele) => {
                return {
                    cid: ele.orderID,
                    pair: ele.symbol,
                    timestamp: new Date(ele.timestamp).toLocaleString(),
                    amount: ele.orderQty,
                    orderType: ele.ordType,
                    exchange: 'bitmex',
                    price: ele.price,
                    stopPrice: ele.stopPx || '',
                    flags: `Execution Instruction: ${ele.execInst}`,
                    params: `Time In Force: ${ele.timeInForce || '-'}, Cum Quantity: ${ele.cumQuantity || '-'} , Display Quantity: ${ele.displayQty || '-'}`,
                    bos: ele.side,
                    status: ele.ordStatus
                };

            });

        } catch (err) {
            console.log(err);
            throw err;
        }
    }

    async getDepositAddress() {
        try {
            return await this.getBitmexData('GET', '/api/v1/user/depositAddress', {}, );
        } catch (err) {
            console.log(err);
            throw err;
        }
    }

    async getUserMargin() {
        try {
            let response = await this.getBitmexData('GET', '/api/v1/user/margin', {}, );
            let parsedData = JSON.parse(response);
            return [{
                wallet_type: 'exchange',
                currency: 'XBT',
                total_bal: Number(parsedData.walletBalance) / 100000000,
                locked_bal: 0,
                avail_bal: Number(parsedData.walletBalance) / 100000000
            }];

        } catch (err) {
            console.log(err);
            throw err;
        }
    }

    async deleteSingleOrder(orderID) {
        try {
            return await this.getBitmexData('DELETE', '/api/v1/order', {
                orderID
            }, );
        } catch (err) {
            console.log(err);
            throw err;
        }
    }

    async deleteAllOrder(filter = {}) {
        try {
            return await this.getBitmexData('DELETE', '/api/v1/order/all', {
                filter
            }, );
        } catch (err) {
            console.log(err);
            throw err;
        }
    }

    async cancelAllOrderAfter(timeout) {
        try {
            return await this.getBitmexData('POST', '/api/v1/order/cancelAllAfter', {
                timeout
            }, );
        } catch (err) {
            console.log(err);
            throw err;
        }
    }

    async closePosition(symbol) {
        try {
            return await this.getBitmexData('POST', '/api/v1/order/closePosition', {
                symbol
            }, );
        } catch (err) {
            console.log(err);
            throw err;
        }
    }

    async riskLimit(symbol, riskLimit) {
        try {
            return await this.getBitmexData('POST', '/api/v1/position/riskLimit', {
                symbol,
                riskLimit
            }, );
        } catch (err) {
            console.log(err);
            throw err;
        }
    }

    async transferMargin(symbol, amount) {
        try {
            return await this.getBitmexData('POST', '/api/v1/position/transferMargin', {
                symbol,
                amount
            }, );
        } catch (err) {
            console.log(err);
            throw err;
        }
    }

    async walletSummary() {
        try {
            return await this.getBitmexData('GET', '/api/v1/user/walletSummary', {}, );
        } catch (err) {
            console.log(err);
            throw err;
        }
    }

    async getLiquidationOrders() {
        try {
            return await this.getBitmexData('GET', '/api/v1/liquidation', {
                reverse: true
            }, );
        } catch (err) {
            console.log(err);
            throw err;
        }
    }

    async getTradingHistory(symbol) {
        try {
            let data = await axios.get(`https://www.bitmex.com/api/v1/trade?symbol=${symbol}&reverse=true&count=100`);
            return (data.data.map((elem) => {
                let obj = {};
                obj.price = elem.price;
                obj.timeStamp = this.dateToDisplayTime(new Date(elem.timestamp.toString()));
                obj.volume = elem.size;
                obj.buyOrSell = elem.side.toLowerCase();
                return obj;
            }));
        } catch (err) {
            console.log(err);
            throw err;
        }
    }

    dateToDisplayTime(date) {
        let hours = date.getHours();
        let minutes = date.getMinutes();
        let seconds = date.getSeconds();
        return `${(hours < 10 ? '0' : '')}${hours}:${(minutes < 10 ? '0' : '')}${minutes}:${(seconds < 10 ? '0' : '')}${seconds}`;
    }

    async getCurrentPrice(pair) {
        let prices = (await axios.get(`https://www.bitmex.com/api/v1/instrument?symbol=${pair}`)).data[0];
        return {
            buy: prices.askPrice,
            sell: prices.bidPrice
        }
    }

}

module.exports = new authBitmexAPI();