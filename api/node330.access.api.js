var restify = require("restify");
var accessModel = require("../data_models/node330.access.js");
var authentication = require("../lib/node330.authentication.js");

module.exports = function(server, socketio, swagger)
{
	server.post(/^\/access\/grant\/(.+)/, function(req, res, next)
	{
		server.requiredParams(req, res, ["username", "password"]);

		// Is this a valid username and password?
		authentication.checkValidUsernamePassword(req.params.username, req.params.password, function(isValid)
		{
			if(!isValid)
			{
				return next(new restify.NotAuthorizedError("Invalid username or password."));
			}

			var access = new accessModel({
				owner: req.params.username,
				resource      : req.params[0],
				description : req.params.description
			});

			access.save(function(err, access)
			{
				if(err)
				{
					throw err;
				}

				res.send({
					status : "success",
					access_code : access.access_code,
					resource : access.resource
				});
			});
		});
	});
}