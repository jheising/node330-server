var restify = require("restify");
var socketio = require("socket.io");
var swagger = require("swagger-doc");
var _ = require("underscore");
var fs = require("fs");
var mongoose = require('mongoose');

// Load our configuration
var configFilename = __dirname + "/config.json";
var config = {}

if(fs.existsSync(configFilename))
{
	config = require("./config.json");
}

// Set defaults for our configuration
_.defaults(config, {
	db_connection: process.env.DB_CONNECTION,
	http_port    : process.env.PORT || 3300
});

// Save our settings, in case any haven't been initialized yet
var configString = JSON.stringify(config, null, 4);
fs.writeFileSync(configFilename, configString);

// Initialize our database connection
mongoose.connect(config.db_connection);
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function callback()
{
	console.log("Database connection established.");
});

// Create our HTTP server
var server = restify.createServer();
server.use(restify.acceptParser(server.acceptable));
server.use(restify.queryParser());
server.use(restify.bodyParser());
server.use(restify.jsonp());
server.use(restify.gzipResponse());

// Create our API documentation
swagger.configure(server);

// Add some convenience functions to our server
server.requiredParams = function(req, res, params)
{
	_.each(params, function(element, index){
		if(!(element in req.params))
		{
			throw new restify.MissingParameterError("The parameter named '" + element + "' is required");
		}
	});
}

server.dbObjectToJSON = function(dbItem)
{
	return _.omit(dbItem, ["__v", "_id"]);
}

var io = socketio.listen(server);

// Load our APIs
var usersAPI = require("./api/node330.user.api.js")(server, io, swagger);
var thingsAPI = require("./api/node330.thing.api.js")(server, io, swagger);
var accessAPI = require("./api/node330.access.api.js")(server, io, swagger);

// Serve static pages
server.get(/\/\/?.*/, restify.serveStatic({
	default  : "index.html",
	directory: "./www"
}));

server.listen(config.http_port, function()
{
	console.log('node330.server listening at %s', server.url);
});
