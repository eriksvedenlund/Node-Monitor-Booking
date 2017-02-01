var mongoose = require("mongoose");

var Schema = mongoose.Schema;
var MonitorSchema = new Schema({
	place: String,
	price: Number,
	available: Boolean
});

var Monitor = mongoose.model("Monitor", MonitorSchema);

module.exports = Monitor;