/**
 * @overview A module to export all the validation modules.
 * @author Blocknomic Technologies
 * @license https://desktop.github.com/eula/
 * @version 0.6.9
 */
/**
 * @exports ./deposits
 * @exports ./orders
 */
module.exports = {
    ...require("./deposits"),
    ...require("./orders"),
};