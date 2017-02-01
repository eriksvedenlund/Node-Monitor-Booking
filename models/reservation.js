var mongoose = require("mongoose");
var User = require("./user");
var Monitor = require('./monitor');

var Schema = mongoose.Schema;
var ReservationSchema = new Schema({
	bookedBy: {
		type: mongoose.Schema.Types.ObjectId,
		ref:'User'
	},
	monitor: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Monitor'
	},
	date: Date
});

var Reservation = mongoose.model("Reservation", ReservationSchema);

module.exports = Reservation;