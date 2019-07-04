const responseBuilder = MODULE("responseBuilder");
const validators = MODULE("validators/index");
const bitfinex = MODEL("bitfinex");
const bitmex = MODEL("authBitmexAPI");
const bequant = MODEL("bequant");
const binance = MODEL("binance");
const bitfinexWallet = MODEL("bitfinex_walletTransferBalance");
const binanceWallet = MODEL("binance_walletTransferBalance");
const bequantWallet = MODEL("bequant_walletTransferBalance");

exports.install = function() {
    F.route('/neworder', new_order, ['authorize', 'post', 'delay']); // PLACING A NEW ORDER
    F.route('/cancel-order', cancel_order, ['authorize', 'post', 'delay']); // CANCEL A ORDER
    F.route('/get-active-orders', get_active_orders, ['authorize', 'post', 'delay']); // FETCHES ACTIVE ORDERS
    F.route('/get-open-positions', get_open_positions, ['authorize', 'post', 'delay']); // GET POSITIONS ORDER
    F.route('/calc-prices', calculate_prices, ['authorize', 'post', 'delay']); // calaculate current price

};

async function new_order() {
    try {
        let response;
        switch (this.body.exchange.toLowerCase()) {
            case 'bitfinex':
                await bitfinex.makeBitfinexRequestPacket(this.body);
                response = { status: true }
                break;
            case 'binance':
                response = await binance.validateBinanceOrder(this.body);
                break;

            case 'bequant':
                await bequant.placeNewOrder(this.body);
                response = { status: true }
                break;
            case 'bitmex':
                response = await bitmex.orders(this.body);
                break;
        }
        responseBuilder.sendResponse(
            200,
            response.status,
            this.req,
            this.res,
            response, {},
            "Order forwarded to exchange"
        );
    } catch (err) {
        responseBuilder.sendInternalServerError(this.req, this.res);
        console.log(err);
        throw err;
    }
}

async function cancel_order() {
    try {
        switch (this.body.exchange.toLowerCase()) {
            case 'bitfinex':
                await bitfinex.cancelOrder(this.body.cid);
                break;
            case 'binance':
                await binance.cancelOrder(this.body.symbol, this.body.cid);
                break;
            case 'bequant':
                await bequant.cancelOrder(this.body.cid);
                break;
            case 'bitmex':
                await bitmex.deleteSingleOrder(this.body.cid);
                break;
        }
        responseBuilder.sendResponse(
            200,
            true,
            this.req,
            this.res, {}, {},
            "Order submitted for cancellation"
        );
    } catch (err) {
        console.log(err);
        throw err;
    }
}

async function get_active_orders() {
    let activeOrders;
    if (this.body.exchange !== '' && this.body.exchange) {
        switch (this.body.exchange) {
            case 'bitfinex':
                activeOrders = await bitfinexWallet.orders(this.body.pair)
                break;
            case 'binance':
                activeOrders = await binance.getAllOpenOrders(this.body.pair);
                break;
            case 'bequant':
                activeOrders = await bequantWallet.activeOrders(this.body.pair);
                break;
            case 'bitmex':
                activeOrders = await bitmex.getOpenOrderHistory(this.body.pair);
                break;
            case 'default':
                let bitfinex = (await bitfinexWallet.orders(this.body.pair)) || [];
                let binanceWallet = (await binance.getAllOpenOrders(this.body.pair)) || [];
                let bequant = (await bequantWallet.activeOrders(this.body.pair)) || [];
                let bitmexOrders = await bitmex.getOpenOrderHistory(this.body.pair) || [];
                activeOrders = bitfinex.concat(binanceWallet, bequant, bitmexOrders)
                break;
        }
    } else {
        let bitfinex = (await bitfinexWallet.orders(this.body.pair)) || [];
        let binanceWallet = (await binance.getAllOpenOrders(this.body.pair)) || [];
        let bequant = (await bequantWallet.activeOrders(this.body.pair)) || [];
        let bitmexOrders = await bitmex.getOpenOrderHistory(this.body.pair) || [];
        activeOrders = bitfinex.concat(binanceWallet, bequant, bitmexOrders);
    }
    responseBuilder.sendResponse(
        200,
        true,
        this.req,
        this.res,
        activeOrders, {},
        "Active Orders"
    );

}

async function calculate_prices() {
    try {
        let prices = {};
        switch (this.body.selectedExchange.text.toLowerCase()) {
            case 'bitfinex':
                prices = await bitfinexWallet.getCurrentPrice(this.body.excPair);
                break;
            case 'binance':
                prices = await binanceWallet.getCurrentPrice(this.body.excPair);
                break;
            case 'bequant':
                prices = await bequantWallet.getCurrentPrice(this.body.excPair);
                break;
            case 'bitmex':
                prices = await bitmex.getCurrentPrice(this.body.origPair);
                break;
        }
        responseBuilder.sendResponse(
            200,
            true,
            this.req,
            this.res,
            prices, {},
            "Calaculated Prices"
        );
    } catch (err) {
        console.log(err);
        logHelper.logErrorFromController(this, err);
        responseBuilder.sendInternalServerError(this.req, this.res);
    }
}

async function get_open_positions() {
    try {
        let response = '';
        if (!this.body.exchange) {
            this.body.exchange = 'bitfinex';
        }
        switch (this.body.exchange.toLowerCase()) {
            case 'bitfinex':
                response = await bitfinexWallet.positions();
                break;
            case 'bitmex':
                response = JSON.parse(await bitmex.getOpenPositions());
                break;
        }
        responseBuilder.sendResponse(
            200,
            true,
            this.req,
            this.res,
            response, {},
            "BITFINEX OPEN POSITIONS"
        );
    } catch (err) {
        console.log(err);
        logHelper.logErrorFromController(this, err);
        responseBuilder.sendInternalServerError(this.req, this.res);
    }
}