const WebSocket = require('ws');
const apiModel = MODEL('bitfinex_walletTransferBalance');
const crypto = require('crypto-js');
const MQTTService = require('../modules/mqtt');
const dbTradeHandler = MODEL('trade_data_handler');

class BitfinexOrders {
    constructor() {
        this.apiParams = {};
        this.wsUrl = 'wss://api.bitfinex.com/ws/2';
        this.connect();
        this.ifAuthenticated = false;
        this.flags = {
            hidden: 64,
            close: 512,
            reduceOnly: 1024,
            postOnly: 4096,
            oco: 16384,
            tif: 0
        }
    }

    async getApiKeys() {
        this.apiParams = await apiModel.getApiKeys(process.env.USERNAME, 'bitfinex');
    }

    webSocketConnection() {
        return new WebSocket(this.wsUrl);
    }

    connect() {
        try {
            this.wss = this.webSocketConnection();
            this.wss.onopen = () => this.handleWsOpen();
            this.wss.onclose = () => this.handleWsClose();
            this.wss.onerror = (err) => this.handleWsError(err);
            this.wss.onmessage = (msg) => this.handleWsMessage(msg);
        } catch (err) {
            console.log(err);
            throw err;
        }

    }

    async authenticateChannel() {
        try {
            if (!this.ifAuthenticated) {
                await this.getApiKeys();
                const authNonce = Math.floor(Date.now() / 100) + "00000000000000000" + Math.floor(Date.now() / 100);
                const authPayload = 'AUTH' + authNonce
                const authSig = crypto.HmacSHA384(authPayload, this.apiParams.apiSecret).toString(crypto.enc.Hex);
                const payload = {
                    apiKey: this.apiParams.apiKey,
                    authSig,
                    authNonce,
                    authPayload,
                    event: 'auth'
                }
                this.wss.send(JSON.stringify(payload));
                this.ifAuthenticated = true;
            }
        } catch (err) {
            console.log(err);
            this.ifAuthenticated = false;
            throw err;
        }

    }

    handleWsOpen() {
        this.authenticateChannel()
    }

    handleWsClose() {
        this.connect();
    }

    handleWsError(err) {
        console.log(err);
        this.connect();
    }

    async handleWsMessage(msg) {
        let recievedMsg = JSON.parse(msg.data);
        if(recievedMsg.event === 'error' && recievedMsg.code=== 10100)  {
            await MQTTService.publishUpdates({
                type: 'error',
                msg: `Bitfinex: API Keys Invalid`
            });
        }
        if (Array.isArray(recievedMsg)) {
            switch (recievedMsg[1]) {
                case 'ws':
                    this.handleWalletSnapshot(recievedMsg[2]);
                    break;
                case 'n':
                    this.handleNotifications(recievedMsg[2][6], recievedMsg[2][7], '');
                    break;
                case 'wu':
                    this.handleWalletUpdate(recievedMsg[2]);
                    this.handleNotifications('Info', `Balance update`, 'balance');

                    break;
                case 'on':
                    let data3 = recievedMsg[2];
                    this.handleNotifications('Success', `Order with CID ${data3[2]} is ${data3[13]}`,'at');
                    // this.handleNotifications('--', `--`,'balance');

                    break;
                case 'te':
                    let data1 = recievedMsg[2];
                    let pair = data1[1];
                    let amount = data1[4];
                    let price = data1[5];
                    let type = data1[6];
                    this.handleNotifications('Success', `${type} order for ${pair} executed @ ${price}(${amount})`,'at');
                    break;
                case 'tu':
                    break;
                case 'oc':
                    let data2 = recievedMsg[2];
                    this.handleNotifications('Success', `Order with CID ${data2[2]} is ${data2[13]}`,'at');
                    // this.handleNotifications('--', `Order with CID`,'balance');
                    break;
                case 'ps': 
                    this.handleNotifications('Info', `Pnl update`, 'pnl');
                    break;

            }
        }
    }

    async handleNotifications(flag, message, updateType) {
        await MQTTService.publishUpdates({
            type: flag,
            msg: `Bitfinex: ${message}`,
            updateType: updateType,
            'exchange': 'bitfinex'
        });
    }

    async handleWalletUpdate(array) {
        // await ledgerModel.updateExchangeLedger([this.walletMap(array)]);
    }

    async handleWalletSnapshot(walletArray) {
        let walletUpdate = await walletArray.map((ele) => this.walletMap(ele));
    }

    walletMap(element) {
        return ['bitfinex', element[0], element[1], element[2], element[3], Number(element[2]) - Number(element[3])]
    }

    async newOrder(payload) {
        let newOrder = [0, "on", null, payload]
        this.wss.send(JSON.stringify(newOrder));
    }

    async cancelOrder(CID) {
        let date = new Date(CID);
        let month = (date.getMonth() + 1);
        if (month < 10) {
            month = "0" + month;
        }
        let day = (date.getDate());
        if (day < 10) {
            day = "0" + day;
        }
        let CID_DATE = date.getFullYear() + "-" + month + "-" + day;
        let payload = [
            0,
            "oc",
            null,
            {
                "cid": CID,
                "cid_date": CID_DATE
            }
        ];
        this.wss.send(JSON.stringify(payload));
    }

    async cancelAllOrder() {
        let payload = [
            0,
            "oc_multi",
            null,
            {
                "all": 1
            }
        ];

        this.wss.send(JSON.stringify(payload));
    }

    async makeBitfinexRequestPacket(requestBody) {
        let flag = 0;
        for (var key in requestBody.flags) {
            // skip loop if the property is from prototype
            if (!requestBody.flags.hasOwnProperty(key)) continue;
            var obj = requestBody.flags[key];
            if (obj === true) {
                flag += this.flags[key] || 0;
            }
        }
        let tif;
        if (requestBody.formData.tif) {
            tif = (requestBody.formData.tif.replace("T", " ")).replace(".000Z", " ");
        }
        if (requestBody.formData.bos === 'sell') {
            requestBody.formData.amount = (-1 * requestBody.formData.amount).toString();
        }
        let orderPacket = {
            cid: Date.now(),
            type: requestBody.orderType,
            symbol: requestBody.pair,
            amount: requestBody.formData.amount,
            price: requestBody.formData.price,
            price_trailing: requestBody.formData.price,
            price_aux_limit: requestBody.formData.price,
            price_oco_stop: requestBody.formData.ocoStopPrice,
            flags: flag,
            tif: tif
        };
        this.newOrder(orderPacket);
    }

    async reconnect() {
        await this.wss.close();
    }
}
let i = new BitfinexOrders();

module.exports = i;