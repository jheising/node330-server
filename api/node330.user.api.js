var restify = require("restify");
var userModel = require("../data_models/node330.user.js");

module.exports = function(server, socketio, swagger)
{
	server.post("/users", function(req, res, next)
	{
		server.requiredParams(req, res, ["username", "password"]);

		var user = new userModel({
			username: req.params.username
		});

		user.exists(function(exists){

			if(exists)
			{
				return next(new restify.InvalidContentError("A user with this name already exists"));
			}
			else
			{
				user.setPassword(req.params.password);

				user.save(function(err, user)
				{
					if(err)
					{
						throw err;
					}

					res.send({status: "success"});
				});
			}
		});
	});
}