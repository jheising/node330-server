var crypto = require("crypto");
var uuid = require("uuid");
var wildcard = require("wildcard");

var authentication = {};

authentication.hashPassword = function(password)
{
	var hash = crypto.createHash('sha256');
	hash.update(password, "utf8");
	return hash.digest("base64");
}

authentication.isValidPasswordHash = function(password, passwordHash)
{
	var hash = crypto.createHash('sha256');

	hash.update(password, "utf8");
	var passedHash = hash.digest("base64");

	return (passedHash === passwordHash);
}

authentication.checkValidUsernamePassword = function(username, password, callback)
{
	var userModel = require("../data_models/node330.user.js");
	userModel.findOne({username:username}, function(err, user)
	{
		if(err)
		{
			throw err;
		}

		if(user)
		{
			var hashedPassword = authentication.hashPassword(password);
			callback((user.password === hashedPassword));
		}
		else
		{
			callback(false);
		}

	});
}

authentication.checkAccessForResource = function(accessCode, resource, callback)
{
	var accessModel = require("../data_models/node330.access.js");
	accessModel.findOne({access_code: accessCode}, function(err, access)
	{
		if(err)
		{
			throw err;
		}

		if(!access)
		{
			callback(false);
			return;
		}

		var allowed = false;

		if(access.resource == "*" || access.resource === resource)
		{
			allowed = true;
		}
		else
		{
			allowed = wildcard(access.resource, resource);
		}

		if(!allowed)
		{
			callback(false);
		}
		else
		{
			callback(true, access.owner);
		}
	});
}

authentication.createUniqueCode = function()
{
	return uuid.v4().replace(/\-/g, "");
}

module.exports = authentication;