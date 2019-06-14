/**
 * @overview Assigns workers to the variables
 * @author CurryCoins
 * @license
 * @version 0.6.9
 */
// var hitBtc = F.worker('hitbtc_market_system', 'hms');
// var bitfinex = F.worker('bitfinex_ws', 'bfw');
// var hitbtc = F.worker('hitbtc_ws', 'hbw');
// var coinSecure = F.worker('coinsecure_rest','csr');
/**
 * @var {*} logger
 */
var logger = F.worker('logger', 'logger');
/**
 * @var {*} mqtt
 */
let mqtt;
if (F.isDebug) {
    mqtt = F.worker('mqtt', 'mqtt');
} else {
    mqtt = F.worker('mqtt', 'mqtt');
}