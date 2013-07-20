var mongoose = require('mongoose');
var authentication = require("../lib/node330.authentication.js");

var user;

var userSchema = mongoose.Schema({
	username   : String,
	email : String,
	created : { type: Date, default: Date.now },
	password : String
});

userSchema.methods.setPassword = function(password)
{
	this.password = authentication.hashPassword(password);
}

userSchema.methods.exists = function(callback)
{
	user.count({ username: this.username }, function(err, count)
	{
		if(callback)
		{
			callback((count > 0));
		}
	});
}

user = module.exports = mongoose.model('user', userSchema);

