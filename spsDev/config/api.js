var path = require('path')
var proURL = require('./prod.env').login_address;
var devURL = require('./dev.env').login_address;
var TURL = require('./T.env').login_address;//开发登录地址

var proURLOut = require('./prod.env').logOut_address;
var devURLOut = require('./dev.env').logOut_address;
var TURLOut = require('./T.env').logOut_address;

export default {
	loginUrl : process.env.NODE_ENV === 'production' ? proURL : process.env.NODE_ENV === 'TEST' ? TURL : devURL,
	logOutUrl : process.env.NODE_ENV === 'production' ? proURLOut : process.env.NODE_ENV === 'TEST' ? TURLOut : devURLOut,
}