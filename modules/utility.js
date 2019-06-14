/**
 * @overview Convert RID to code and vice versa
 * @author Blocknomic Technologies
 * @license https://desktop.github.com/eula/
 * @version 0.6.9
 */
/**
 * A prefix for the referrals
 * @constant
 * @type {string}
 * @default
 */
const referralPrefix = "CC";
/**
 * Referral Additional Value
 * @constant
 * @type {string}
 * @default
 */
const referralAdditionValue = 20000000;
/**
 * A function to convert ID to referral code
 * @param {number} id - Referral ID
 * @returns [{string}] Referral Code
 */
function convertToReferralCode(id) {
    return `${referralPrefix}${referralAdditionValue + parseInt(id)}`;
}
/**
 * A function to convert referral code to ID
 * @param {number} referralCode - Referral Code
 * @returns [{string}] Referral ID
 */
function convertReferralCodeToID(referralCode) {
    return (
        parseInt(referralCode.slice(referralPrefix.length)) - referralAdditionValue
    );
}
/**
 * @exports convertToReferralCode
 * @exports convertReferralCodeToID
 */
module.exports = {
    convertToReferralCode,
    convertReferralCodeToID
};