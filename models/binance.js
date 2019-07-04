const WebSocket = require('ws');
const apiModel = MODEL('binance_walletTransferBalance');
const crypto = require('crypto');
const MQTTService = require('../modules/mqtt');
const axios = require('axios').default;

class BinanceOrders {
    constructor() {
        this.apiObj = {};
        this.construct();
        this.axios;
        this.listenKey = '';
        this.apiParams = {};
        this.wsUrl = 'wss://stream.binance.com:9443/ws/';
        this.ifAuthenticated = false;
    }
    webSocketConnection() {
        return new WebSocket(`${this.wsUrl}${this._ListenKey}`);
    }

    async connect() {
        try {
            await this.userDataStream();
            this.wss = this.webSocketConnection();
            this.wss.onclose = () => this.handleWsClose();
            this.wss.onopen = () => this.handleWsOPem();
            this.wss.onerror = (err) => this.handleWsError(err);
            this.wss.onmessage = (msg) => this.handleWsMessage(msg);
        } catch (err) {
            console.log(err);
            throw err;
        }
    }
    handleWsOPem() {
    }
    handleWsClose() {
        this.connect();
    }

    handleWsError(err) {
        this.connect();
        console.log(err);
    }

    async handleWsMessage(msg) {
        let data = JSON.parse(msg.data);
        if (data.e === 'executionReport') {
            let NotfiyMsg = `Binance ${data.S} ${data.o} order with cid ${data.E} is ${data.X}(${data.x}) reason ${data.r}`;
            await MQTTService.publishUpdates({
                type: 'success',
                msg: `${NotfiyMsg}`,
                updateType: 'at',
                'exchange': 'binance'
            });
        } 
        if(data.e === 'outboundAccountInfo') {
            let NotfiyMsg = `Balances Updated`;
            await MQTTService.publishUpdates({
                type: 'Info',
                msg: `${NotfiyMsg}`,
                updateType: 'balance',
                'exchange': 'binance'
            });
        }
    }
    async construct() {
        await this.getApiKeys();
        var headers = {
            'X-MBX-APIKEY': this.apiObj.apiKey,
        };

        this.axios = axios.create({
            baseURL: `https://www.binance.com/`,
            headers: headers
        });
        this.getExchangeInfo();
        this.userDataStream();
        this.connect();

    }

    async getApiKeys() {
        this.apiObj = await apiModel.getApiKeys(process.env.USERNAME, 'binance');
    }

    buildData(endPoint, body) {
        let query = Object.keys(body).reduce(function(a, k) {
            a.push(k + '=' + encodeURIComponent(body[k]));
            return a;
        }, []).join('&');
        let signature = crypto.createHmac('sha256', this.apiObj.apiSecret).update(query).digest('hex');

        return endPoint + '?' + query + '&signature=' + signature;
    }

    async userDataStream() {
        let { listenKey } = (await this.axios.post('/api/v1/userDataStream')).data;
        this._ListenKey = listenKey;
        this.getExchangeInfo();
        let thisIs = this;
        setInterval(function() {
            thisIs.getExchangeInfo();
            thisIs.userDataStreamKeepAlive();
        }, 1700000);
    }

    async userDataStreamKeepAlive() {
        await this.axios.put(`/api/v1/userDataStream?listenKey=${this._ListenKey}`);
    }

    async newOrder(opt) {
        let endPoint = '/api/v3/order';
        let posturl = this.buildData(endPoint, opt);

        let newOrderResponse = await new Promise((resolve, reject) => {
            this.axios.post(posturl).then(response => { resolve(response.data) }).catch(error => {
                resolve(error.response.data);
            });
        });
        if (newOrderResponse.msg) {
            newOrderResponse = await this.processResponse(newOrderResponse.msg, opt.pair);
        }

        return newOrderResponse;

    }

    async cancelOrder(symbol, cid) {
        let endPoint = '/api/v3/order';
        let opt = {
            symbol: 'BTCUSDT',
            origClientOrderId: cid,
            timestamp: Date.now()
        }
        let posturl = this.buildData(endPoint, opt);

        let newOrderResponse = await new Promise((resolve, reject) => {
            this.axios.delete(posturl).then(response => { resolve(response.data) }).catch(error => {
                resolve(error.response.data);
            });
        });
        return newOrderResponse.status || newOrderResponse.msg;

    }

    async processResponse(msg, symbol) {
        if (msg.includes('PERCENT_PRICE')) {
            return {
                status: false,
                type: 'Filter Error',
                msg: 'Price is not in valid range.'
            }
        }
        if (msg.includes('PRICE_FILTER')) {
            let msg = 'Invalid price';
            if (this.exchangeInfo[symbol]) {
                let priceFilter = this.exchangeInfo[symbol].filters[0];
                msg = `Price for ${symbol} should be between ${priceFilter.minPrice} and ${priceFilter.maxPrice}`;
            }
            return {
                status: false,
                type: 'Filter Error',
                msg: msg
            }
        }
        if (msg.includes('LOT_SIZE')) {
            let msg = 'Order amount is less than allowed minimum amount value';
            if (this.exchangeInfo[symbol]) {
                let lotFilter = this.exchangeInfo[symbol].filters[2];
                msg = `Order amount should be between ${lotFilter.minQty} and ${lotFilter.maxQty}`;
            }
            return {
                status: false,
                type: 'Filter Error',
                msg: msg
            }
        }
        if (msg.includes('MIN_NOTIONAL')) {
            let msg = 'Order value is less than allowed minimum notional value';
            if (this.exchangeInfo[symbol]) {
                let minFilter = this.exchangeInfo[symbol].filters[3];
                msg = `Order minimum notional value should be greater or equal to ${minFilter.minNotional}`;
            }
            return {
                status: false,
                type: 'Filter Error',
                msg: msg
            }
        }
        if (msg.includes('ICEBERG_PARTS')) {
            let msg = 'Max iceberg limit';
            if (this.exchangeInfo[symbol]) {
                let iceFilter = this.exchangeInfo[symbol].filters[4];
                msg = `Max iceberg limit is ${iceFilter.limit}`;
            }
            return {
                status: false,
                type: 'Filter Error',
                msg: msg
            }
        }
        if (msg.includes('MARKET_LOT_SIZE')) {
            let msg = 'Invalid amount';
            if (this.exchangeInfo[symbol]) {
                let mLotSize = this.exchangeInfo[symbol].filters[5];
                msg = `Order amount should be between ${mLotSize.minQty} and ${mLotSize.maxQty}`;
            }
            return {
                status: false,
                type: 'Filter Error',
                msg: msg
            }
        }
        if (msg.includes('MAX_NUM_ICEBERG_ORDERS')) {
            let msg = `Max number of iceberg orders placed for ${symbol}`;
            if (this.exchangeInfo[symbol]) {
                let mLotSize = this.exchangeInfo[symbol].filters[8];
                msg = `Iceberg order limit reached for ${symbol}. Orders allowed is ${mLotSize.limit}`;
            }
            return {
                status: false,
                type: 'Filter Error',
                msg: `Iceberg order limit reached for ${symbol}. Orders allowed is ${num}`
            }
        }
        if (msg.includes('MAX_NUM_ORDERS')) {
            let msg = `Maximum orders placed for ${symbol}`;
            if (this.exchangeInfo[symbol]) {
                let mNuOrders = this.exchangeInfo[symbol].filters[6];
                msg = `Order limit reached for ${symbol}.Maximum orders allowed are ${mNuOrders.limit}`;
            }
            return {
                status: false,
                type: 'Filter Error',
                msg: msg
            }
        }

        return {
            status: false,
            type: 'Error',
            msg: msg
        }
    }

    async getExchangeInfo() {
        try {
            let exchangeInfo = await this.axios.get('/api/v1/exchangeInfo');
            let obj = {};
            exchangeInfo.data.symbols.map((ele) => {
                obj[ele.symbol] = ele;
            });
            this.exchangeInfo = obj;
        } catch (err) {
            console.log(err);
            throw err;
        }

    }

    async getAllOpenOrders() {
        try {
        let openOrders = (await this.axios.get(this.buildData('/api/v3/openOrders', { timestamp: Date.now() }))).data;
        return openOrders.map((ele) => {
            return {
                cid: ele.clientOrderId,
                pair: ele.symbol,
                timestamp: new Date(ele.time).toLocaleString(),
                amount: ele.executedQty,
                orderType: ele.type,
                exchange: 'binance',
                price: ele.price,
                stopPrice: ele.stopPrice,
                flags: `Is Working: ${ele.isWorking}`,
                params: `IceBerg Qty: ${ele.icebergQty}, Original Quantity: ${ele.origQty}, Cummulative Quote Qty: ${ele.cummulativeQuoteQty}`,
                bos: ele.side,
                status: ele.status
            }
        });
    } catch(err){
        return [];
    }
    }

    async validateBinanceOrder(newOrderBody) {
        let opt = {
            symbol: newOrderBody.pair,
            side: newOrderBody.formData.bos,
            type: newOrderBody.orderType,
            quantity: newOrderBody.formData.amount,
            newClientOrderId: Date.now().toString(),
            timestamp: Date.now()
        };
        if (opt.type.includes('LIMIT')) {
            opt.price = newOrderBody.formData.price;
            opt.timeInForce = 'GTC';
        }
        if (typeof newOrderBody.timeInForce !== 'undefined') opt.timeInForce = newOrderBody.tif;

        /*
         * STOP_LOSS
         * STOP_LOSS_LIMIT
         * TAKE_PROFIT
         * TAKE_PROFIT_LIMIT
         * LIMIT_MAKER
         */
        if (typeof newOrderBody.formData.icebergQty !== 'undefined') opt.icebergQty = newOrderBody.formData.icebergQty;
        if (typeof newOrderBody.formData.stopPrice !== 'undefined') {
            opt.stopPrice = newOrderBody.formData.stopPrice;
            if (opt.side === 'buy') {
                if (opt.stopPrice < opt.price) {
                    opt.type = 'TAKE_PROFIT_LIMIT';
                } else {
                    opt.type = 'STOP_LOSS_LIMIT';
                }
            } else {
                if (opt.stopPrice > opt.price) {
                    opt.type = 'TAKE_PROFIT_LIMIT';
                } else {
                    opt.type = 'STOP_LOSS_LIMIT';
                }
            }
        }
        return await this.newOrder(opt);


    }

    async priceFilterValidator(symbol, price) {
        let minPrice = this.exchangeInfo[symbol].filters[0].minPrice;
        return {
            value: price > minPrice,
            minPrice
        };
    }

    // async lotSizeVaildator(symbol,qty) {
    //     let minQty  = this.exchangeInfo[symbol].filters[2].minQty;
    //     let maxQty  = this.exchangeInfo[symbol].filters[2].maxQty;
    //     return qty<maxQty && qty>minQty;
    // }

    async lotSizeVaildator(symbol, qty) {
        let minQty = this.exchangeInfo[symbol].filters[2].minQty;
        let maxQty = this.exchangeInfo[symbol].filters[2].maxQty;
        return {
            value: qty < maxQty && qty > minQty,
            minQty,
            maxQty
        };
    }

    async minNotionalValidator(symbol, qty, price) {
        let minNotional = this.exchangeInfo[symbol].filters[3].minNotional;
        return {
            value: (qty * price) > minNotional,
            minNotional
        };
    }

    async reconnect() {
        await this.wss.close();
    }

}

let i = new BinanceOrders();

module.exports = i;