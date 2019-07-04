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
console.log('Starting server');
console.log('---------------');
console.log('Please ensure all the exchanges you wish to use the API keys are added');
console.log("HAPPY TRADING");
console.log('')
console.log('')
console.log('')

let mqtt;
if (F.isDebug) {
    mqtt = F.worker('mqtt', 'mqtt');
} else {
    mqtt = F.worker('mqtt', 'mqtt');
}