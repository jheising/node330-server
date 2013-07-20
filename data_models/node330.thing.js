var mongoose = require('mongoose');

var thing;

var thingSchema = mongoose.Schema({
	thing_id: String,
	owner: String,
	name: String,
	created: { type: Date, default: Date.now },
	config: mongoose.Schema.Types.Mixed,
	status: mongoose.Schema.Types.Mixed
});

thing = module.exports = mongoose.model('thing', thingSchema);