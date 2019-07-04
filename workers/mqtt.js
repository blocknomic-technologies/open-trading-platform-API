require('total.js');
F.load('debug', ['config'], '../');
const TIMEOUT_INTERVAL = 5 * 60 * 1000; // 5 minutes
const uuidSessionMap = {};
const uuidTimerIdMap = {};
const WebSocket = require('ws');
const device = new WebSocket.Server({ port: 8085 });
let ws = '';
device.on('connection', (wes) => {
    ws = wes;
    ws.on('message', function(message) {
        var msg = JSON.parse(message);
        switch (msg.type) {
            case 'ping':
                if ((msg.origin || '').includes("localhost")) {
                    return;
                }
                if (uuidTimerIdMap[msg.uuid]) {
                    delete uuidTimerIdMap[msg.uuid];
                    clearTimeout(uuidTimerIdMap[msg.uuid]);

                }
                uuidTimerIdMap[msg.uuid] = setTimeout(() => {
                    delete uuidSessionMap[msg.uuid]
                }, TIMEOUT_INTERVAL)
                uuidSessionMap[msg.uuid] = msg;
                uuidSessionMap[msg.uuid].pingTime = Date.now();
                device.publish('onTheLines', JSON.stringify({
                        type: 'onlineUsers',
                        payload: Object.values(uuidSessionMap)
                    }))
                break;

        }
    });

})
device.on('error', console.log)

process.on('message', (message) => {
    switch (message.type) {
        case 'publishLedger':
            return ws.send(JSON.stringify(message.payload));
        case 'publishOrderPlaced':
            return ws.send(JSON.stringify(message.payload));
        case 'publishOrderFilled':
            return ws.send(JSON.stringify(message.payload));
        case 'publishOrderCanceled':
            return ws.send(JSON.stringify(message.payload));
        case 'publishOrderPartiallyFilled':
            return ws.send(JSON.stringify(message.payload));
        case 'publishOrderUpdated':
            return ws.send(JSON.stringify(message.payload));
        case 'publishBitfinexNotifications':
            return ws.send(JSON.stringify(message.payload));
    }
});
process.on('uncaughtException', console.log)