/**
 * @overview A module to broadcast notification by making contact with AWS IOT.
 * @author CurryCoins
 * @license
 * @version 0.6.9
 */
/**
 * @module ledger
 */
const ledgerModel = MODEL('ledger');
/**
 * @module active_orders
 */
const activeOrdersModel = MODEL('active_orders');
/**
 * @module order_history
 */
const orderHistoryModel = MODEL('order_history');
/**
 * @module user
 */
const userService = MODEL('user');
/**
 * A class encapsulating all functions which require notfications to be broadcasted.
 * @module MQTTService
 */
class MQTTService {
    /**
     * A function to broadcast notification when the ledger is published and update the same on the frontend.
     * @param {string} user - Username
     */
    async publishUpdates(payload) {
            try {
                // let mqttKey = await userService.get_mqtt_key(process.env.USERNAME);
                if (F.workers.mqtt) {
                    F.workers.mqtt.send({
                        type: 'publishBitfinexNotifications',
                        mqttKey: process.env.USERNAME,
                        payload: {
                            type: 'bitfinexNotifications',
                            data: payload
                        }
                    });
                }
            } catch (err) {
                console.log(err);
                throw err;
            }

        }
        /**
         * A function to broadcast notification when the ledger is published and update the same on the frontend.
         * @param {string} user - Username
         */
    async publishLedger(user) {
            // let mqttKey = await userService.get_mqtt_key(user);
            F.workers.mqtt.send({
                type: 'publishLedger',
                mqttKey: user,
                payload: {
                    type: 'ledger',
                    data: await ledgerModel.getLedger(user)
                }
            })
        }
        /**
         * A function to broadcast notification when a order is placed and update the same on the frontend.
         * @param {string} user - User name
         */
    async publishOrderPlaced(user) {
            // let mqttKey = await userService.get_mqtt_key(user);

            const [
                ledger,
                activeOrders,
            ] = await Promise.all([
                await ledgerModel.getLedger(user),
                await activeOrdersModel.getActiveOrders(user),
            ]);
            F.workers.mqtt.send({
                type: 'publishOrderPlaced',
                mqttKey: user,
                payload: {
                    type: 'orderPlaced',
                    data: {
                        ledger,
                        activeOrders,
                    }
                }
            })
        }
        /**
         * A function to broadcast notification when a order is fulfilled and update the same on the frontend.
         * @param {string} user - User name
         */
    async publishOrderFilled(user) {
        // let mqttKey = await userService.get_mqtt_key(user);

        const [
            ledger,
            activeOrders,
            recentTrades,
        ] = await Promise.all([
            await ledgerModel.getLedger(user),
            await activeOrdersModel.getActiveOrders(user),
            await orderHistoryModel.getRecentOrders(user),
        ]);
        F.workers.mqtt.send({
            type: 'publishOrderFilled',
            mqttKey: user,
            payload: {
                type: 'orderFilled',
                data: {
                    ledger,
                    activeOrders,
                    recentTrades,
                }
            }
        })
    }

    async publishOrderUpdated(user) {
            // let mqttKey = await userService.get_mqtt_key(user);

            const [
                ledger,
                activeOrders,
            ] = await Promise.all([
                await ledgerModel.getLedger(user),
                await activeOrdersModel.getActiveOrders(user),
            ]);
            F.workers.mqtt.send({
                type: 'publishOrderUpdated',
                mqttKey: user,
                payload: {
                    type: 'orderUpdated',
                    data: {
                        ledger,
                        activeOrders,
                    }
                }
            })
        }
        /**
         * A function to broadcast notification when a order is cancelled and update the same on the frontend.
         * @param {string} user - user name
         */
    async publishOrderCanceled(user) {

            const [
                ledger,
                activeOrders,
                recentTrades,
            ] = await Promise.all([
                await ledgerModel.getLedger(user),
                await activeOrdersModel.getActiveOrders(user),
                await orderHistoryModel.getRecentOrders(user),
            ]);
            F.workers.mqtt.send({
                type: 'publishOrderCanceled',
                mqttKey: user,
                payload: {
                    type: 'orderCanceled',
                    data: {
                        ledger,
                        activeOrders,
                        recentTrades,
                    }
                }
            })
        }
        /**
         * A function to broadcast notification when a order is partially fulfilled and update the same on the frontend.
         * @param {string} user - user name
         */
    async publishOrderPartiallyFilled(user) {

        const [
            ledger,
            activeOrders,
            recentTrades,
        ] = await Promise.all([
            await ledgerModel.getLedger(user),
            await activeOrdersModel.getActiveOrders(user),
            await orderHistoryModel.getRecentOrders(user),
        ]);
        F.workers.mqtt.send({
            type: 'publishOrderPartiallyFilled',
            mqttKey: user,
            payload: {
                type: 'orderPartiallyFilled',
                data: {
                    ledger,
                    activeOrders,
                    recentTrades,
                }
            }
        })
    }
}
/**
 * @exports MQTTService
 */
module.exports = new MQTTService();