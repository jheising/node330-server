var restify = require("restify");
var _ = require("underscore");
var thingModel = require("../data_models/node330.thing.js");
var authentication = require("../lib/node330.authentication.js");

module.exports = function(server, socketio, swagger)
{
	function getThing(thingID, ownerUsername, createNew, callback)
	{
		thingModel.findOne({thing_id: thingID, owner: ownerUsername}, function(err, thing){

			if(err)
			{
				throw err;
			}

			if(!thing && createNew)
			{
				thing = new thingModel({
					thing_id : thingID,
					owner: ownerUsername
				});
			}

			callback(thing);
		});
	}

	function updateThingStatus(req, res, next)
	{
		server.requiredParams(req, res, ["access_code"]);

		authentication.checkAccessForResource(req.params.access_code, "things/" + req.params.thing_id + "/status/set", function(isValid, ownerUsername)
		{
			if(!isValid)
			{
				return next(new restify.NotAuthorizedError("Invalid access code."));
			}

			getThing(req.params.thing_id, ownerUsername, true, function(thing){

				thing.status = _.omit(req.params, ["access_code", "thing_id"]);

				thing.save(function(err, thing){

					if(err)
					{
						throw err;
					}

					res.send({status: "success"});
				});
			});
		});
	}

	function updateThingConfig(req, res, next)
	{
		server.requiredParams(req, res, ["access_code"]);

		authentication.checkAccessForResource(req.params.access_code, "things/" + req.params.thing_id + "/config/set", function(isValid, ownerUsername)
		{
			if(!isValid)
			{
				return next(new restify.NotAuthorizedError("Invalid access code."));
			}

			getThing(req.params.thing_id, ownerUsername, true, function(thing)
			{
				thing.config = _.omit(req.params, ["access_code", "thing_id"]);

				thing.save(function(err, thing)
				{

					if(err)
					{
						throw err;
					}

					res.send({status: "success"});
				});
			});
		});
	}

	// Update the status of a thing
	server.put("/things/:thing_id/status", updateThingStatus);
	server.post("/things/:thing_id/status", updateThingStatus);

	// Get the status of a thing
	server.get("/things/:thing_id/status", function(req, res, next)
	{

		authentication.checkAccessForResource(req.params.access_code, "things/" + req.params.thing_id + "/status/get", function(isValid, ownerUsername)
		{
			if(!isValid)
			{
				return next(new restify.NotAuthorizedError("Invalid access code."));
			}

			getThing(req.params.thing_id, ownerUsername, false, function(thing)
			{
				if(!thing)
				{
					return next(new restify.ResourceNotFoundError("Thing does not exist."));
				}

				res.send(thing.status);
			});
		});

	});

	// Update the config of a thing
	server.put("/things/:thing_id/config", updateThingConfig);
	server.post("/things/:thing_id/config", updateThingConfig);

	// Get the config of a thing
	server.get("/things/:thing_id/config", function(req, res, next)
	{

		authentication.checkAccessForResource(req.params.access_code, "things/" + req.params.thing_id + "/config/get", function(isValid, ownerUsername)
		{
			if(!isValid)
			{
				return next(new restify.NotAuthorizedError("Invalid access code."));
			}

			getThing(req.params.thing_id, ownerUsername, false, function(thing)
			{
				if(!thing)
				{
					return next(new restify.ResourceNotFoundError("Thing does not exist."));
				}

				res.send(thing.config);
			});
		});

	});
}