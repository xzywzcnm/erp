var merge = require('webpack-merge')
var prodEnv = require('./prod.env')

module.exports = merge(prodEnv, {
  NODE_ENV: '"development"',
  login_address:"http://10.0.0.132:9665/?u=",
  logOut_address:"http://10.0.0.132:9665/logout?u="
})
