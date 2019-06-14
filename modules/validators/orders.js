/**
 * @overview A module for validation of cryptocurrency transaction related 
 * @author Blocknomic Technologies
 * @license https://desktop.github.com/eula/
 * @version 0.6.9
 */
/**
 * @module active_orders
 */
let activeOrdersModel = MODEL('active_orders')

/**
 * A function to validate details entered for cancel order requests.
 * @param {Object} requestBody - Request Body for Cancel order requests
 * @param {string} userName - Username
 * @returns [{Object}] Validation Errors
 */
async function validateCancelOrderRequest(requestBody, userName) {
    let validationErrors = []
    if (!requestBody.orderId) {
        validationErrors.push("Order ID not provided");
    } else {
        let order = await activeOrdersModel.getOrder(requestBody.orderId, userName);
        if (!order) {
            validationErrors.push("Order ID not provided");
        } else if (order.orderType === "Market") {
            validationErrors.push("Cannot cancel a Market order");
        } else if (order.status === "filled") {
            validationErrors.push("Order has already been filled. Cannot cancel.");
        } else if (order.status === "canceled") {
            validationErrors.push("Order has already been canceled. Cannot cancel.");
        }
    }
    return validationErrors;
}
/**
 * @exports validateCancelOrderRequest
 */
module.exports = {
    validateCancelOrderRequest,
}