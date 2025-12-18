var createError = require('http-errors');
var cookieSession = require("cookie-session");
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var admin = require('./routes/admin');
var category = require('./routes/category');
var subcategory = require('./routes/subcategory');
var brand = require('./routes/brand');
var offer = require('./routes/offer');
var banner = require('./routes/banner');
// var delivery = require('./routes/delivery');
var coupon = require('./routes/coupon');
var size = require('./routes/size');
var timeslot = require('./routes/timeslot');
var pincode = require('./routes/pincode');
var product = require('./routes/product');
var api = require('./routes/api');
var login = require('./routes/login');
var partner_api = require('./routes/partner-api');
var testimonials = require('./routes/testimonials');
var photoshot = require('./routes/photoshot');
var blog = require('./routes/blog');
var country = require('./routes/country');
var state = require('./routes/state')

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(
  cookieSession({
    name: "session",
    keys: ["naman"],

     //Cookie Options
    maxAge: 168 * 60 * 60 * 100 // 24 hours
  })
);


app.use('/', indexRouter);
app.use('/customers', usersRouter);
app.use('/admin',admin);
app.use('/category',category);
app.use('/subcategory',subcategory);
app.use('/brand',brand);
app.use('/offer',offer);  
app.use('/banner',banner);
// app.use('/delivery',delivery);
app.use('/coupon',coupon);
app.use('/size',size);
app.use('/time-slot',timeslot);
app.use('/pincode',pincode);
app.use('/purchase-product',product);
app.use('/api',api);
app.use('/login',login);
app.use('/partner-api',partner_api);
app.use('/testimonials',testimonials);
app.use('/photoshot',photoshot);
app.use('/blog',blog);
app.use('/country',country);
app.use('/state',state);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development

  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
