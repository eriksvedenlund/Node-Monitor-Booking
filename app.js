var express = require('express');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var session = require('express-session');
var MongoStore = require('connect-mongo')(session);
var Monitor = require("./models/monitor");
var app = express();

//database stuffz
mongoose.Promise = global.Promise;
mongoose.connect("mongodb://localhost:27017/monitordb");
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));

var monitorData = [
  {
    place: "Centralstationen",
    price: 9000,
    available: true
  },
  {
    place: "Korsvägen",
    price: 7000,
    available: true
  },
  {
    place: "Brunnsparken",
    price: 11000,
    available: true
  },
  {
    place: "Götaplatsen",
    price: 9000,
    available: true
  },
  {
    place: "Grönsakstorget",
    price: 6000,
    available: true
  },
  {
    place: "Svingeln",
    price: 8000,
    available: true
  },
  {
    place: "Östra hamngatan",
    price: 10000,
    available: true
  },
  {
    place: "Vasastan",
    price: 6000,
    available: true
  },
  {
    place: "Kungsportsplatsen",
    price: 5000,
    available: true
  },
];

Monitor.remove({}, function(err){
  if(err) console.error(err);
  Monitor.create(monitorData, function(err, monitors){
    if (err) console.error(err);
  });
});

//create session
app.use(session({
	secret: 'Monitor loves you',
	resave: true,
	saveUninitialized: false,
	store: new MongoStore({
		mongooseConnection: db
	})
}));

//make user id available in templates
app.use(function(req, res, next){
	res.locals.currentUser = req.session.userId;
	next();
});

// parse incoming requests
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// serve static files from /public
app.use(express.static(__dirname + '/public'));

// view engine setup
app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');

// include routes
var routes = require('./routes/index');
app.use('/', routes);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('File Not Found');
  err.status = 404;
  next(err);
});

// error handler
// define as the last app.use callback
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

// listen on port 3000
app.listen(3000, function () {
  console.log('Express app listening on port 3000');
});
