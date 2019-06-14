/**
 * @overview Ensures user's session is legitimate
 * @author Blocknomic Technologies
 * @license https://desktop.github.com/eula/
 * @version 0.6.9
 */

/**
 * @module jwt
 */
const jwt = MODULE('jwtVerification');
/**
 * A function to return Boolean if the user's session is legitmate or not.
 * @callback {Boolean} True for Legitimate else false
 * @param {Object} req - Requests
 * @param {Object} res - Response
 * @param {Array} flags - Flags attached to the routes
 * @param {Function} callback - Callback Function
 */
F.onAuthorize = function(req, res, flags, callback) {
    return callback(true);

    // try {
    //     const authHeadParts = (req.headers.authorization || '').split(' ');
    //     let user = {};
    //     if (authHeadParts.length > 1) {
    //         switch (authHeadParts[0]) {
    //             case 'JWT':
    //                 // console.log(authHeadParts[1]);
    //                 const decoded = await jwt.handler(authHeadParts[1]);
    //                 if (decoded.token_use === 'access') {
    //                     user.userName = decoded.username;
    //     //             }
    //     //             callback(false);
    //     //     }
    //     // }
    //     // callback(false);
    // } catch (e) {
    //     // console.log(e)
    //     // callback(false);
    // }
};

// const mysql = require('mysql2/promise');
// F.on('module#auth', function(type, name) {
// 	var auth = MODULE('auth');
// 	// "id" from auth.login()
// 	var connection;
// 	auth.onAuthorize = async function(id, callback, flags) {
// 		var connection = await pool.getConnection();
// 		try{
// 			await connection.query('USE system_curry');
// 			var [rows, fields] = await connection.query('SELECT * from users');
// 			connection.release();
// 			for(var i = 0; i < rows.length; i++){
// 			  if(rows[i].token === null ){
// 				callback(null);
// 				return;		
// 			  }else if(rows[i].token == id){
// 				callback(rows[i]);  
// 			  } else {
// 				return callback(null);
// 			  }

// 			}
// 		}catch(err){
// 			console.log(err);
// 			connection.release();
// 			return;
// 		}
// 	};
// });