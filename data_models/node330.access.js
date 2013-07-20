var mongoose = require('mongoose');
var authentication = require("../lib/node330.authentication.js");

var access;

var accessSchema = mongoose.Schema({
	access_code : {type: String, default:function(){return authentication.createUniqueCode();}},
	owner   : String,
	resource: String,
	description: String
});

access = module.exports = mongoose.model('access_codes', accessSchema);