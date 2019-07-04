const responseBuilder = MODULE("responseBuilder");
const validators = MODULE("validators/index");
const bitfinexWallet = MODEL("bitfinex_walletTransferBalance");
const bequantWallet = MODEL("bequant_walletTransferBalance");
const binanceWallet = MODEL("binance_walletTransferBalance");
const binanceService = require("../modules/third_party/binance");
const bitmexAPIs = MODEL("authBitmexAPI");
const bitfinex = MODEL('bitfinex');
const binance = MODEL('binance');
const bequant = MODEL('bequant');
const user = MODULE("users");
exports.install = function() {
    F.route("/bequant-wallet-transfer-request", bequant_fund_transfer, ["post", "authorized", "delay"]);
    F.route("/bequant-trade-history-request", bequant_trade_history, ["post", "authorized", "delay"]);
    F.route("/bequant-transaction-history-request", bequant_transaction_history, ["post", "authorized", "delay"]);
    F.route("/bequant-deposit-address-request", bequant_deposit_address, ["post", "authorized", "delay"]);
    F.route("/bequant-trading-wallet-balance-request", bequant_trading_wallet_balance, ["post", "authorized", "delay"]);
    F.route("/bequant-main-wallet-balance-request", bequant_main_wallet_balance, ["post", "authorized", "delay"]);
    F.route("/bitfinex-wallet-transfer-request", bitfinex_fund_transfer, ["post", "authorized", "delay"]);
    F.route("/bitfinex-trade-history-request", bitfinex_trade_history, ["post", "authorized", "delay"]);
    F.route("/bitfinex-transaction-history-request", bitfinex_transaction_history, ["post", "authorized", "delay"]);
    F.route("/bitfinex-deposit-address-request", bitfinex_deposit_address, ["post", "authorized", "delay"]);
    F.route("/bitfinex-wallet-balance-request", bitfinex_wallet_balance, ["post", "authorized", "delay"]);
    F.route("/binance-withdraw-history-request", binance_withdraw_history, ["post", "authorized", "delay"]);
    F.route("/binance-deposit-history-request", binance_deposit_history, ["post", "authorized", "delay"]);
    F.route("/binance-deposit-address-request", binance_deposit_address, ["post", "authorized", "delay"]);
    F.route("/binance-trading-history-request", binance_trading_history, ["post", "authorized", "delay"]);
    F.route("/binance-wallet-balance-request", binance_wallet_balance, ["post", "authorized", "delay"]);
    F.route("/single-wallet-balance", single_wallet_balance, ["post", "authorized", "delay"]);
    F.route("/refresh-wallet-balances", refresh_wallet_balances, ["post", "authorized", "delay"]);
    F.route("/bitfinex-refresh-wallet-balances", bitfinex_refresh_wallet_balance, ["post", "authorized", "delay"]);
    F.route("/binance-refresh-wallet-balances", binance_refresh_wallet_balance, ["post", "authorized", "delay"]);
    F.route("/bequant-refresh-wallet-balances", bequant_refresh_wallet_balance, ["post", "authorized", "delay"]);
    F.route("/bequant-order-history-request", bequant_order_history, ["post", "authorized", "delay"]);
    F.route("/binance-order-history-request", binance_order_history, ["post", "authorized", "delay"]);
    F.route("/bitfinex-order-history-request", bitfinex_order_history, ["post", "authorized", "delay"]);
    F.route("/bitfinex-positions-history-request", bitfinex_positions_history, ["post", "authorized", "delay"]);
    F.route('/notify-api-change', notify_api_change, ["get", "authorized", "delay"]);
    F.route('/bitfinex-margin-info', bitfinex_margin_info, ["post", "authorized", "delay"]);
    F.route("/get-pair-wise-balance", getBalancePairExchangeWise, ["post", "authorize"]);
    F.route("/place-bitmex-orders", place_Bitmex_Orders, ["post", "authorize"]);
    F.route("/fetch-bitmex-balance", fetch_Bitmex_Balance, ["post", "authorize"]);
    F.route("/fetch-bitmex-order-history", fetch_Bitmex_Order_History, ["post", "authorize"]);
    F.route("/fetch-bitmex-swap-funding-history", fetch_Bitmex_Swap_Funding_History, ["post", "authorize"]);
    F.route("/get-bitmex-contracts", fetch_Bitmex_contracts, ["get", "authorize"]);
    F.route("/fetch-bitmex-positions-history", fetch_Bitmex_Positions_History, ["post", "authorize"]);
    F.route("/fetch-bitmex-open-positions", fetch_Bitmex_Open_Positions, ["post", "authorize"]);
    F.route("/set-bitmex-position-leverage", set_Bitmex_Leverage, ["post", "authorize"]);
    F.route("/bitmex-open-orders", get_Open_Order_History, ["get", "authorize"]);
    F.route("/bitmex-deposit-address", get_Deposit_Address, ["get", "authorize"]);
    F.route("/bitmex-user-margin", get_User_Margin, ["post", "authorize"]);
    F.route("/bitmex-delete-single-order", delete_Single_Order, ["get", "authorize"]);
    F.route("/bitmex-delete-all-order", delete_All_Orders, ["get", "authorize"]);
    F.route("/bitmex-cancel-all-order-after", cancel_All_After, ["get", "authorize"]);
    F.route("/bitmex-close-position", close_Position, ["post", "authorize"]);
    F.route("/bitmex-risk-limit", set_Risk_Limit, ["get", "authorize"]);
    F.route("/bitmex-transfer-margin", set_Transfer_Margin, ["get", "authorize"]);
    F.route("/bitmex-wallet-summary", get_Wallet_Summary, ["post", "authorize"]);
    F.route("/bitmex-liquidation-orders", get_Liquidation_Orders, ["post", "authorize"]);
    F.route("/bitmex-trading-history", get_Trading_History, ["post"]);
    F.route("/fetch-bitmex-pair-list", get_Bitmex_Pair_List, ["post", "authorize"]);
    F.route("/get-bitmex-open-position", get_bitmex_open_position, ["post", "authorize"]);
    F.route("/get-binance-kline-data", get_binance_kline_data, ["get"]);
    F.route("/get-binance-data", get_binance_data, ["get"]);
};



async function get_binance_data() {
    let queryParamObj = Utils.parseQuery(this.req.uri.query);
    try {
        responseBuilder.sendResponse(
            200,
            true,
            this.req,
            this.res,
            await binanceService.getTradesAndDepth(queryParamObj.pair), {},
            "Binance Update"
        );
    } catch (err) {
        console.log(err);
        logHelper.logErrorFromController(this, err);
        responseBuilder.sendInternalServerError(this.req, this.res);
    }
}

async function get_binance_kline_data() {
    let queryParamObj = Utils.parseQuery(this.req.uri.query);
    try {
        responseBuilder.sendResponse(
            200,
            true,
            this.req,
            this.res,
            await binanceService.getKlineData(queryParamObj.symbol, queryParamObj.interval), {},
            "Binance Kline Update"
        );
    } catch (err) {
        console.log(err);
        logHelper.logErrorFromController(this, err);
        responseBuilder.sendInternalServerError(this.req, this.res);
    }
}

async function bequant_fund_transfer() {
    try {
        responseBuilder.sendResponse(
            200,
            true,
            this.req,
            this.res,
            await bequantWallet.processAllTransfers(this.body), {},
            "Funds Successfully Transferred"
        );
    } catch (err) {
        console.log(err);
        logHelper.logErrorFromController(this, err);
        responseBuilder.sendInternalServerError(this.req, this.res);
    }
}

async function bequant_trade_history() {
    try {
        responseBuilder.sendResponse(
            200,
            true,
            this.req,
            this.res,
            await bequantWallet.tradingHistory(), {},
            "Trading History is Here"
        );
    } catch (err) {
        console.log(err);
        logHelper.logErrorFromController(this, err);
        responseBuilder.sendInternalServerError(this.req, this.res);
    }
}
async function bequant_transaction_history() {
    try {
        responseBuilder.sendResponse(
            200,
            true,
            this.req,
            this.res,
            await bequantWallet.transactionHistory(), {},
            "Transaction History is Here"
        );
    } catch (err) {
        console.log(err);
        logHelper.logErrorFromController(this, err);
        responseBuilder.sendInternalServerError(this.req, this.res);
    }
}

async function bitfinex_fund_transfer() {
    try {
        responseBuilder.sendResponse(
            200,
            true,
            this.req,
            this.res,
            await bitfinexWallet.processAllTransfers(this.body), {},
            "Funds Successfully Transferred"
        );
    } catch (err) {
        console.log(err);
        logHelper.logErrorFromController(this, err);
        responseBuilder.sendInternalServerError(this.req, this.res);
    }
}

async function bitfinex_trade_history() {
    try {
        responseBuilder.sendResponse(
            200,
            true,
            this.req,
            this.res,
            await bitfinexWallet.tradingHistory(), {},
            "Trading History is Here"
        );
    } catch (err) {
        console.log(err);
        logHelper.logErrorFromController(this, err);
        responseBuilder.sendInternalServerError(this.req, this.res);
    }
}
async function bitfinex_transaction_history() {
    try {
        responseBuilder.sendResponse(
            200,
            true,
            this.req,
            this.res,
            await bitfinexWallet.transactionHistory(), {},
            "Transaction History is Here"
        );
    } catch (err) {
        console.log(err);
        logHelper.logErrorFromController(this, err);
        responseBuilder.sendInternalServerError(this.req, this.res);
    }
}
async function binance_deposit_history() {
    try {
        responseBuilder.sendResponse(
            200,
            true,
            this.req,
            this.res,
            await binanceWallet.depositHistory(), {},
            "Transaction History is Here"
        );
    } catch (err) {
        console.log(err);
        logHelper.logErrorFromController(this, err);
        responseBuilder.sendInternalServerError(this.req, this.res);
    }
}
async function binance_withdraw_history() {
    try {
        responseBuilder.sendResponse(
            200,
            true,
            this.req,
            this.res,
            await binanceWallet.withdrawalHistory(), {},
            "Transaction History is Here"
        );
    } catch (err) {
        console.log(err);
        logHelper.logErrorFromController(this, err);
        responseBuilder.sendInternalServerError(this.req, this.res);
    }
}


async function bequant_deposit_address() {
    try {
        responseBuilder.sendResponse(
            200,
            true,
            this.req,
            this.res,
            await bequantWallet.fetchDepositAddress(this.body.currency), {},
            "Deposit Address is Here"
        );
    } catch (err) {
        console.log(err);
        logHelper.logErrorFromController(this, err);
        responseBuilder.sendInternalServerError(this.req, this.res);
    }
}
async function bitfinex_deposit_address() {
    try {
        responseBuilder.sendResponse(
            200,
            true,
            this.req,
            this.res,
            await bitfinexWallet.fetchDepositAddress(this.body.currency), {},
            "Deposit Address is Here"
        );
    } catch (err) {
        console.log(err);
        logHelper.logErrorFromController(this, err);
        responseBuilder.sendInternalServerError(this.req, this.res);
    }
}
async function binance_deposit_address() {
    try {
        responseBuilder.sendResponse(
            200,
            true,
            this.req,
            this.res,
            await binanceWallet.fetchDepositAddress(this.body.currency), {},
            "Deposit Address is Here"
        );
    } catch (err) {
        console.log(err);
        logHelper.logErrorFromController(this, err);
        responseBuilder.sendInternalServerError(this.req, this.res);
    }
}

async function binance_trading_history() {
    try {
        responseBuilder.sendResponse(
            200,
            true,
            this.req,
            this.res,
            await binanceWallet.tradingHistory(this.body.symbol), {},
            "Trading History is Here"
        );
    } catch (err) {
        console.log(err);
        logHelper.logErrorFromController(this, err);
        responseBuilder.sendInternalServerError(this.req, this.res);
    }
}
async function binance_wallet_balance() {
    try {
        responseBuilder.sendResponse(
            200,
            true,
            this.req,
            this.res,
            await binanceWallet.binanceWalletBalance(), {},
            "Wallet Balance Is Here"
        );
    } catch (err) {
        console.log(err);
        logHelper.logErrorFromController(this, err);
        responseBuilder.sendInternalServerError(this.req, this.res);
    }
}
async function bequant_trading_wallet_balance() {
    try {
        responseBuilder.sendResponse(
            200,
            true,
            this.req,
            this.res,
            await bequantWallet.bequantWalletBalance(), {},
            "Wallet Balance Is Here"
        );
    } catch (err) {
        console.log(err);
        logHelper.logErrorFromController(this, err);
        responseBuilder.sendInternalServerError(this.req, this.res);
    }
}

async function bequant_main_wallet_balance() {
    try {
        responseBuilder.sendResponse(
            200,
            true,
            this.req,
            this.res,
            await bequantWallet.mainAccountBalance(), {},
            "Wallet Balance Is Here"
        );
    } catch (err) {
        console.log(err);
        logHelper.logErrorFromController(this, err);
        responseBuilder.sendInternalServerError(this.req, this.res);
    }
}

async function bitfinex_wallet_balance() {
    try {
        responseBuilder.sendResponse(
            200,
            true,
            this.req,
            this.res,
            await bitfinexWallet.bitfinexWalletBalance(), {},
            "Wallet Balance Is Here"
        );
    } catch (err) {
        console.log(err);
        logHelper.logErrorFromController(this, err);
        responseBuilder.sendInternalServerError(this.req, this.res);
    }
}

async function single_wallet_balance() {
    try {
        responseBuilder.sendResponse(
            200,
            true,
            this.req,
            this.res,
            await user.getPairWiseBalance(this.body.selectedPair), {},
            "Single currency balance"
        );
    } catch (err) {
        console.log(err);
        logHelper.logErrorFromController(this, err);
        responseBuilder.sendInternalServerError(this.req, this.res);
    }
}


async function refresh_wallet_balances() {
    try {
        await Promise.all[await bitfinexWallet.refresh_wallet_balance(),
            await bequantWallet.refresh_wallet_balance(),
            await binanceWallet.refresh_wallet_balance()];
        responseBuilder.sendResponse(
            200,
            true,
            this.req,
            this.res, {}, {},
            "Refreshed Exchange Balance"
        );
    } catch (err) {
        console.log(err);
        logHelper.logErrorFromController(this, err);
        responseBuilder.sendInternalServerError(this.req, this.res);
    }
}
async function bitfinex_refresh_wallet_balance() {
    try {
        responseBuilder.sendResponse(
            200,
            true,
            this.req,
            this.res,
            await bitfinexWallet.refresh_wallet_balance(), {},
            "Bitfinex Exchange Balance"
        );
    } catch (err) {
        console.log(err);
        logHelper.logErrorFromController(this, err);
        responseBuilder.sendInternalServerError(this.req, this.res);
    }
}
async function binance_refresh_wallet_balance() {
    try {
        responseBuilder.sendResponse(
            200,
            true,
            this.req,
            this.res,
            await binanceWallet.refresh_wallet_balance(), {},
            "Binance Exchange Balance"
        );
    } catch (err) {
        console.log(err);
        logHelper.logErrorFromController(this, err);
        responseBuilder.sendInternalServerError(this.req, this.res);
    }
}
async function bequant_refresh_wallet_balance() {
    try {
        responseBuilder.sendResponse(
            200,
            true,
            this.req,
            this.res,
            await bequantWallet.refresh_wallet_balance(), {},
            "Bequant Exchange Balance"
        );
    } catch (err) {
        console.log(err);
        logHelper.logErrorFromController(this, err);
        responseBuilder.sendInternalServerError(this.req, this.res);
    }
}

async function bequant_order_history() {
    try {
        responseBuilder.sendResponse(
            200,
            true,
            this.req,
            this.res,
            await bequantWallet.ordersHistory(), {},
            "Bequant Order History"
        );
    } catch (err) {
        console.log(err);
        logHelper.logErrorFromController(this, err);
        responseBuilder.sendInternalServerError(this.req, this.res);
    }
}

async function binance_order_history() {
    try {
        responseBuilder.sendResponse(
            200,
            true,
            this.req,
            this.res,
            await binanceWallet.ordersHistory(this.body.symbol), {},
            "Bitfinex Order History"
        );
    } catch (err) {
        console.log(err);
        logHelper.logErrorFromController(this, err);
        responseBuilder.sendInternalServerError(this.req, this.res);
    }
}

async function bitfinex_order_history() {
    try {
        responseBuilder.sendResponse(
            200,
            true,
            this.req,
            this.res,
            await bitfinexWallet.ordersHistory(), {},
            "Bitfinex Order History"
        );
    } catch (err) {
        console.log(err);
        logHelper.logErrorFromController(this, err);
        responseBuilder.sendInternalServerError(this.req, this.res);
    }
}

async function bitfinex_positions_history() {
    try {
        responseBuilder.sendResponse(
            200,
            true,
            this.req,
            this.res,
            await bitfinexWallet.positionsHistory(), {},
            "Bitfinex Positions History"
        );
    } catch (err) {
        console.log(err);
        logHelper.logErrorFromController(this, err);
        responseBuilder.sendInternalServerError(this.req, this.res);
    }
}

async function notify_api_change() {
    await bitfinex.reconnect();
    await binance.reconnect();
    await bequant.reconnect();
}

async function bitfinex_margin_info() {
    try {
        responseBuilder.sendResponse(
            200,
            true,
            this.req,
            this.res,
            await bitfinexWallet.marginsInfo(this.body.key || 'base'), {},
            "Bitfinex Margin Info"
        );
    } catch (err) {
        console.log(err);
        logHelper.logErrorFromController(this, err);
        responseBuilder.sendInternalServerError(this.req, this.res);
    }
    return
}

async function getBalancePairExchangeWise() {
    try {
        responseBuilder.sendResponse(
            200,
            true,
            this.req,
            this.res,
            await user.getBalancePairExchangeWise(this.body.selectedPair, this.body.selectedExchange, this.body.orderType, this.body.excPair), {},
            "Balance"
        );
    } catch (err) {
        console.log(err);
        logHelper.logErrorFromController(this, err);
        responseBuilder.sendInternalServerError(this.req, this.res);
    }
}

async function place_Bitmex_Orders() {
    try {
        responseBuilder.sendResponse(
            200,
            true,
            this.req,
            this.res,
            await bitmexAPIs.orders(this.body.data), {},
            "Bitmex Order Placed"
        );
    } catch (err) {
        console.log(err);
        logHelper.logErrorFromController(this, err);
        responseBuilder.sendInternalServerError(this.req, this.res);
    }
}

async function fetch_Bitmex_Balance() {
    try {
        responseBuilder.sendResponse(
            200,
            true,
            this.req,
            this.res,
            await bitmexAPIs.getBalanceFromBitmex(), {},
            "Bitmex Order Placed"
        );
    } catch (err) {
        console.log(err);
        logHelper.logErrorFromController(this, err);
        responseBuilder.sendInternalServerError(this.req, this.res);
    }
}

async function fetch_Bitmex_Order_History() {
    try {
        responseBuilder.sendResponse(
            200,
            true,
            this.req,
            this.res,
            await bitmexAPIs.getOrderHistory(), {},
            "Bitmex Order History"
        );
    } catch (err) {
        console.log(err);
        logHelper.logErrorFromController(this, err);
        responseBuilder.sendInternalServerError(this.req, this.res);
    }
}

async function fetch_Bitmex_Swap_Funding_History() {
    try {
        responseBuilder.sendResponse(
            200,
            true,
            this.req,
            this.res,
            await bitmexAPIs.getSwapFundingHistory(), {},
            "Bitmex Funding Swap History"
        );
    } catch (err) {
        console.log(err);
        logHelper.logErrorFromController(this, err);
        responseBuilder.sendInternalServerError(this.req, this.res);
    }
}


async function fetch_Bitmex_Positions_History() {
    try {
        responseBuilder.sendResponse(
            200,
            true,
            this.req,
            this.res,
            await bitmexAPIs.getPositionsHistory(), {},
            "Bitmex Positions History"
        );
    } catch (err) {
        console.log(err);
        logHelper.logErrorFromController(this, err);
        responseBuilder.sendInternalServerError(this.req, this.res);
    }
}

async function fetch_Bitmex_Open_Positions() {
    try {
        responseBuilder.sendResponse(
            200,
            true,
            this.req,
            this.res,
            await bitmexAPIs.getOpenPositions(), {},
            "Bitmex Open Positions"
        );
    } catch (err) {
        console.log(err);
        logHelper.logErrorFromController(this, err);
        responseBuilder.sendInternalServerError(this.req, this.res);
    }
}

async function fetch_Bitmex_contracts() {
    try {
        responseBuilder.sendResponse(
            200,
            true,
            this.req,
            this.res,
            await bitmexAPIs.getPairList(), {},
            "Bitmex Pair List"
        );
    } catch (err) {
        console.log(err);
        logHelper.logErrorFromController(this, err);
        responseBuilder.sendInternalServerError(this.req, this.res);
    }
}

async function set_Bitmex_Leverage() {
    try {
        responseBuilder.sendResponse(
            200,
            true,
            this.req,
            this.res,
            await bitmexAPIs.setLeverage(this.body.symbol, this.body.leverage, ), {},
            "Leverage sucessfully set"
        );
    } catch (err) {
        console.log(err);
        logHelper.logErrorFromController(this, err);
        responseBuilder.sendInternalServerError(this.req, this.res);
    }
}


async function get_Open_Order_History() {
    try {
        responseBuilder.sendResponse(
            200,
            true,
            this.req,
            this.res,
            await bitmexAPIs.getOpenOrderHistory(), {},
            "Open orders"
        );
    } catch (err) {
        console.log(err);
        logHelper.logErrorFromController(this, err);
        responseBuilder.sendInternalServerError(this.req, this.res);
    }
}

async function get_Deposit_Address() {
    try {
        responseBuilder.sendResponse(
            200,
            true,
            this.req,
            this.res,
            await bitmexAPIs.getDepositAddress(), {},
            "Deposit address"
        );
    } catch (err) {
        console.log(err);
        logHelper.logErrorFromController(this, err);
        responseBuilder.sendInternalServerError(this.req, this.res);
    }
}
async function get_User_Margin() {
    try {
        responseBuilder.sendResponse(
            200,
            true,
            this.req,
            this.res,
            await bitmexAPIs.getUserMargin(), {},
            "Deposit address"
        );
    } catch (err) {
        console.log(err);
        logHelper.logErrorFromController(this, err);
        responseBuilder.sendInternalServerError(this.req, this.res);
    }
}
async function delete_Single_Order() {
    try {
        responseBuilder.sendResponse(
            200,
            true,
            this.req,
            this.res,
            await bitmexAPIs.deleteSingleOrder(this.body.orderID, this.body.clOrdID, ), {},
            "Deposit address"
        );
    } catch (err) {
        console.log(err);
        logHelper.logErrorFromController(this, err);
        responseBuilder.sendInternalServerError(this.req, this.res);
    }
}
async function delete_All_Orders() {
    try {
        responseBuilder.sendResponse(
            200,
            true,
            this.req,
            this.res,
            await bitmexAPIs.deleteAllOrder(this.body.filter), {},
            "Deposit address"
        );
    } catch (err) {
        console.log(err);
        logHelper.logErrorFromController(this, err);
        responseBuilder.sendInternalServerError(this.req, this.res);
    }
}
async function cancel_All_After() {
    try {
        responseBuilder.sendResponse(
            200,
            true,
            this.req,
            this.res,
            await bitmexAPIs.cancelAllOrderAfter(this.body.timeout), {},
            "Deposit address"
        );
    } catch (err) {
        console.log(err);
        logHelper.logErrorFromController(this, err);
        responseBuilder.sendInternalServerError(this.req, this.res);
    }
}
async function close_Position() {
    try {
        responseBuilder.sendResponse(
            200,
            true,
            this.req,
            this.res,
            await bitmexAPIs.closePosition(this.body.symbol), {},
            "Deposit address"
        );
    } catch (err) {
        console.log(err);
        logHelper.logErrorFromController(this, err);
        responseBuilder.sendInternalServerError(this.req, this.res);
    }
}
async function set_Risk_Limit() {
    try {
        responseBuilder.sendResponse(
            200,
            true,
            this.req,
            this.res,
            await bitmexAPIs.riskLimit(this.body.symbol, this.body.riskLimit), {},
            "Close position bitmex"
        );
    } catch (err) {
        console.log(err);
        logHelper.logErrorFromController(this, err);
        responseBuilder.sendInternalServerError(this.req, this.res);
    }
}
async function set_Transfer_Margin() {
    try {
        responseBuilder.sendResponse(
            200,
            true,
            this.req,
            this.res,
            await bitmexAPIs.transferMargin(this.body.symbol, this.body.amount), {},
            "Deposit address"
        );
    } catch (err) {
        console.log(err);
        logHelper.logErrorFromController(this, err);
        responseBuilder.sendInternalServerError(this.req, this.res);
    }
}
async function get_Wallet_Summary() {
    try {
        responseBuilder.sendResponse(
            200,
            true,
            this.req,
            this.res,
            await bitmexAPIs.walletSummary(), {},
            "Wallet Summary"
        );
    } catch (err) {
        console.log(err);
        logHelper.logErrorFromController(this, err);
        responseBuilder.sendInternalServerError(this.req, this.res);
    }
}

async function get_Liquidation_Orders() {
    try {
        responseBuilder.sendResponse(
            200,
            true,
            this.req,
            this.res,
            await bitmexAPIs.getLiquidationOrders(), {},
            "Liquidation Orders"
        );
    } catch (err) {
        console.log(err);
        logHelper.logErrorFromController(this, err);
        responseBuilder.sendInternalServerError(this.req, this.res);
    }
}

async function get_Trading_History() {
    try {
        responseBuilder.sendResponse(
            200,
            true,
            this.req,
            this.res,
            await bitmexAPIs.getTradingHistory(this.body.symbol), {},
            "Bitmex Trading History"
        );
    } catch (err) {
        console.log(err);
        logHelper.logErrorFromController(this, err);
        responseBuilder.sendInternalServerError(this.req, this.res);
    }
}

async function get_Bitmex_Pair_List() {
    try {
        responseBuilder.sendResponse(
            200,
            true,
            this.req,
            this.res,
            await bitmexAPIs.getPairList(), {},
            "Bitmex Pair List"
        );
    } catch (err) {
        console.log(err);
        logHelper.logErrorFromController(this, err);
        responseBuilder.sendInternalServerError(this.req, this.res);
    }
}

async function get_bitmex_open_position() {
    try {
        responseBuilder.sendResponse(
            200,
            true,
            this.req,
            this.res,
            await bitmexAPIs.getOpenPositionsBYSymbol(this.body.symbol), {},
            "Bitmex Position"
        );
    } catch (err) {
        console.log(err);
        logHelper.logErrorFromController(this, err);
        responseBuilder.sendInternalServerError(this.req, this.res);
    }
}