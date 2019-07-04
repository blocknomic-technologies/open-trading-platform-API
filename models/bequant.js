const WebSocket = require('ws');
const apiModel = MODEL('bequant_walletTransferBalance');
const crypto = require('crypto-js');
const ledgerModel = MODEL('ledger');
const MQTTService = require('../modules/mqtt');
const dbTradeHandler = MODEL('trade_data_handler');

class BequantOrders {
    constructor() {
        this.apiParams = {};
        this.wsUrl = 'wss://api.bequant.io/api/2/ws';
        this.connect();
        this.count = 0;
    }

    async getApiKeys() {
        this.apiParams = await apiModel.getApiKeys();
    }
 
    webSocketConnection() {
        return new WebSocket(this.wsUrl);
    }

    async connect() {
        try {
            await this.getApiKeys();
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

    handleWsClose() {
        this.connect();
    }

    handleWsError(err) {
        console.log(err);
        this.connect();
    }

    async handleWsMessage(msg) {
        let packet = JSON.parse(msg.data);
        let notifymsg;
        let flag;
        if (packet.method === 'report') {
            flag = 'success';
            notifymsg = `Bequant ${packet.params.side} ${packet.params.type} order of ${packet.params.symbol} for ${packet.params.quantity} with CID: ${packet.params.clientOrderId} is ${packet.params.status}`;
            await MQTTService.publishUpdates({
                type: flag,
                msg: notifymsg,
                updateType: 'at',
                'exchange': 'bequant'
            });
            await MQTTService.publishUpdates({
                type: 'Info',
                msg: 'notifymsg',
                updateType: 'balance',
                'exchange': 'bequant'
            });
            
        } else if (packet['error']) {
            flag = 'error';
            notifymsg = `Bequant: ${packet.error.message}:${packet.error.description}`;
            await MQTTService.publishUpdates({
                type: flag,
                msg: notifymsg,
                updateType: 'at',
                'exchange': 'bequant'
            });
        }
        
    }

    handleWsOpen() {
        try {
            this.authenticateSession();
        } catch (err) {
            console.log(err);
            throw err;
        }
    }


    authenticateSession() {
        let payload = {
            "method": "login",
            "params": {
                "algo": "BASIC",
                "pKey": this.apiParams.apiKey,
                "sKey": this.apiParams.apiSecret
            }
        };

        this.wss.send(JSON.stringify(payload));
        this.subscribeReports();
    }

    subscribeReports() {
        let payload = {
            "method": "subscribeReports",
            "params": {}
        };
        this.wss.send(JSON.stringify(payload));
    }

    placeNewOrder(data) {
        let payload = {
            "method": "newOrder",
            "params": {
                "clientOrderId": Date.now().toString(),
                "symbol": data.pair,
                "side": data.formData.bos,
                "type": data.orderType,
                "price": Number(data.formData.price),
                "quantity": Number(data.formData.amount),
                "timeInForce": data.tif,
                "stopPrice": Number(data.formData.stopPrice),
                "expireTime": data.formData.tif,
                "postOnly": data.flags.postOnly
            },
            // "params": {
            //       "clientOrderId": Date.now().toString(),
            //       "symbol": "BTCUSD",
            //       "side": "buy",
            //       "type": "limit",
            //       "price": 0.01,
            //       "quantity": 1,
            //       "timeInForce": '',
            //       "stopPrice": '',
            //       "expireTime": '',
            //       "postOnly": false
            //     },
            "id": 123
        };
        this.wss.send(JSON.stringify(payload));
    }

    cancelOrder(cid) {
        let payload = { "method": "cancelOrder", "params": { "clientOrderId": cid }, "id": 123 };
        this.wss.send(JSON.stringify(payload));
    }

    closePosition(id) {
        let params = { "id": id, flags: 512 };
        let payload = [0, 'ou', null, null, params];
        this.wss.send(JSON.stringify(payload));
    }

    async reconnect() {
        await this.wss.close();

    }
}

let i = new BequantOrders();

module.exports = i;