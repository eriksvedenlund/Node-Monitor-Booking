var express = require('express');
var router = express.Router();
var User = require('../models/user');
var mid = require('../middleware');
var Monitor = require('../models/monitor');
var Reservation = require('../models/reservation');

//visa profil
router.get('/profile', mid.requiresLogin, function(req, res, next){
	User.findById(req.session.userId)
		.exec(function(error, user){
			if(error){
				return next(error);
			} else{
			  Reservation
			    .find({bookedBy: user._id})
			    .populate('monitor')
			    .exec(function(error, reservations){
			  	return res.render('profile', {title: 'Profile', name: user.name, reservations: reservations});
			  });
			}
		});
});

//skapa reservation
router.post('/reservation/:id', mid.requiresLogin, function(req, res, next){
    var date = req.body.date;
    var monitor_id = req.body.monitor_id;
    var user_id = req.session.userId;
    var reservationData = {
    	bookedBy: user_id,
    	monitor: monitor_id,
    	date: date
    };
    Reservation.findOne({date: date, monitor: monitor_id}, function(error, reservation){
      if(reservation != null) {
      	var err = new Error('Det finns redan en bokning på det datumet.');
      	err.status = 403;
      	return next(err);
      } else {
      	Reservation.create(reservationData, function(error, reservation){
	    	if(error) {
	    		return next(error);
	    	} else{
	    		return res.redirect('/profile');
	    	}
	    });
      }
    });
});

//visa reservation för uppdatering
router.get('/reservation/:id', function(req, res, next){
	Reservation
	.findById(req.params.id)
	.populate('monitor')
	.exec(function(error, reservation){
		if(error){
			return next(error);
		} else {
			return res.render('update', {reservation: reservation});
		}
	});
});

//uppdatera reservation
router.post('/reservation/:id/update', function(req, res, next){
	var date = req.body.date;
    var monitor_id = req.body.monitor_id;
	Reservation.findOne({date: date, monitor: monitor_id}, function(error, reservation){
      if(reservation != null) {
      	var err = new Error('Det finns redan en bokning på det datumet.');
      	err.status = 403;
      	return next(err);
      } else{
	    Reservation.findByIdAndUpdate(req.params.id, {date: date}, function(err, reservation){
			if (err){
				return next(err);
			} else {
				return res.redirect('/profile');
			}
		});
      }
  });
});

//ta bort reservation
router.get('/reservation/:id/delete', function(req, res, next){
	Reservation.findByIdAndRemove(req.params.id, function(err, reservation){
		if(err){
			return next(err);
		} else{
			return res.redirect('/profile');
		}
	});
});

// Visa en specifik monitor
router.get('/monitor/:id', mid.requiresLogin, function(req, res, next){
	Monitor.findById(req.params.id, function(err, monitor){
		if (err){
			return next(err);
		} else{
			return res.render('monitor', {monitor: monitor});
		}
	});
});

//Visa alla monitors
router.get('/monitors', mid.requiresLogin, function(req, res, next){
	Monitor.find({available: true}, function(err, monitors){
		if (err){
			return next(err);
		} else{
			return res.render('monitors', {monitors: monitors});
		}
	});
});

router.get('/admin', mid.requiresAdmin, function(req, res, next){
	Reservation
	  .find({})
	  .populate('bookedBy')
	  .populate('monitor')
	  .exec(function(error, reservations){
	  	if(error){
	  		return next(error);
	  	} else {
	  		return res.render('admin', {reservations: reservations});
	  	}
	});
});

//GET /logout
router.get('/logout', function(req, res, next){
	if(req.session){
		//delete session object
		req.session.destroy(function(error){
			if(error){
				return next(error);
			}
			else{
				return res.redirect('/');
			}
		});
	}
});

//GET /login
router.get('/login', mid.loggedOut, function(req, res, next){
	return res.render('login', {title: 'Log in'});
});

//POST /login
router.post('/login', function(req, res, next){
	if(req.body.email && req.body.password){
		User.authenticate(req.body.email, req.body.password, function(error, user){
			if(error || !user){
				var err = new Error('Wrong email or password');
				err.status = 401;
				return next(err);
			}
			req.session.userId = user._id;
			return res.redirect('/profile');
		});
	} else{
		var err = new Error('All fields required');
		err.status = 401;
		return next(err);
	}
});

//GET /register
router.get('/register', mid.loggedOut, function(req, res, next){
	return res.render('register', {title : 'Sign Up'});
});

//POST /register
router.post('/register', function(req, res, next){
	if(req.body.email &&
		req.body.name &&
		req.body.password &&
		req.body.confirmPassword){

		//confirm user typed the same password twice
		if(req.body.password !== req.body.confirmPassword){
			var err = new Error('Passwords do not match.');
			err.status = 400;
			return next(err);
		}

		//create object with form input
		var userData = {
			email: req.body.email,
			name: req.body.name,
			password: req.body.password
		};
		//insert object to mongoDB
		User.create(userData, function(error, user){
			if(error){
				return next(error);
			}
			else{
				req.session.userId = user._id;
				return res.redirect('/profile');
			}
		});
	} else{
		var err = new Error('All fields required');
		err.status = 400;
		return next(err);
	}
});

router.get('/', function(req, res, next){
	return res.render('index', {title: 'Home'});
});

router.get('/contact', mid.requiresLogin, function(req, res, next){
	return res.render('contact', {title: 'Contact'});
});

router.get('/map', mid.requiresLogin, function(req, res, next){
	return res.render('map', {title: 'Map'});
});

module.exports = router;
