




var express = require('express');
var path = require('path');
var favicon = require('static-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var MailListener = require("mail-listener2");

var routes = require('./routes/index');
//var users = require('./routes/users');
var add = require('./routes/add');
var addin = require('./routes/addin');
var edit = require('./routes/edit');
var editin = require('./routes/editin');
var editdrink = require('./routes/editdrink');
var ingredients = require('./routes/ingredients');
var email = require('./routes/email');
var drinksHistory = require('./routes/drinkshistory');
var historypage = require('./routes/historypage');
var payments = require('./routes/payments');

var mongoose = require('mongoose');
var db = mongoose.createConnection('localhost', 'barmixvah');

var DrinkSchema = require('./models/Drink.js').DrinkSchema;
var Drink = db.model('drinks', DrinkSchema);

var PumpSchema = require('./models/Pump.js').PumpSchema;
var Pump = db.model('pumps', PumpSchema);

var IngredientsSchema = require('./models/Ingredients.js').IngredientsSchema;
var Ing = db.model('ings', IngredientsSchema);

var HistorySchema = require('./models/Drinkshistory.js').HistorySchema;
var History = db.model('history', HistorySchema);

var robot = require('./public/javascripts/robot/backend.js');

var busboy = require('connect-busboy'); //middleware for form/file upload

var app = express();
app.use(busboy());

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(favicon());
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', routes.index(Drink, Pump, Ing));
app.get('/add', add.form(Drink, Ing));
app.get('/edit', edit.show(Drink));
app.get('/addin', addin.form(Ing));
app.get('/editin', editin.show(Ing));
app.get('/editdrink/:drinkId', function (req, res) {
  editdrink.show(Drink, Ing, req.params.drinkId, res);
});
app.get('/historypage', historypage.show(History));
//app.use('/users', users);

app.post('/updatepump.json', routes.updatePump(Pump));
app.post('/drink.json', add.addDrink(Drink));
app.post('/pump.json', add.addPump(Pump));
app.post('/updatedrink.json', edit.updateDrink(Drink));
app.post('/ing.json', addin.addIng(Ing));
app.post('/updateing.json', editin.updateIng(Ing));
app.post('/updateingmulti.json', editin.updateIngMulti(Ing));
app.post('/uploadimage.json', editdrink.uploadImage(Drink));
app.post('/email.json', email.email());
app.post('/adddrinkhistory.json', drinksHistory.add(History));
app.post('/qrcode.json', payments.qrcode(History));
app.post('/paymentStatus.json', payments.status(History));
app.post('/paymentCancel.json', payments.cancel(History));

/// catch 404 and forwarding to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});


var server = app.listen(3000, '0.0.0.0');
var io = require('socket.io').listen(server);

io.sockets.on('connection', function (socket) {
  socket.on("Make Drink", function (ingredients) {
    robot.pump(ingredients);
    console.log(ingredients);
  });

  socket.on("Start Pump", function (pump) {
    robot.startPump(pump);
  });

  socket.on("Stop Pump", function (pump) {
    robot.stopPump(pump);
  });
});


db.once('open', function () {
  Pump.findOne({}, function (err, pump) {
    if (pump == null) {
      var pumps = {
        label: "pumps",
        ingredients: [ { label: "pump0", ingredient: "" } ]
      };
      Pump.create(pumps);
    }
  });
});

/// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});


module.exports = app;



// Mail listener
// This is the function to listen to our mailbox for incoming drink payments, and update the database when we get one
var mailListener = new MailListener({
  username: "barmachinatest@netlocomotion.com",
  password: "BarMachinaTest123!",
  host: "mail.netlocomotion.com",
  port: 993, // imap port
  tls: true,
  connTimeout: 10000, // Default by node-imap
  authTimeout: 5000, // Default by node-imap,
  debug: console.log, // Or your custom function with only one incoming argument. Default: null
  tlsOptions: { rejectUnauthorized: false },
  mailbox: "INBOX", // mailbox to monitor
  searchFilter: ["UNSEEN"], // the search filter being used after an IDLE notification has been retrieved
  markSeen: true, // all fetched email willbe marked as seen and not fetched next time
  fetchUnreadOnStart: true, // use it only if you want to get all unread email on lib start. Default is `false`,
  mailParserOptions: {streamAttachments: true}, // options to be passed to mailParser lib.
  attachments: true, // download attachments as they are encountered to the project directory
  attachmentOptions: { directory: "attachments/" } // specify a download directory for attachments
});

mailListener.start(); // start listening

mailListener.on("server:connected", function(){
  console.log("imapConnected");
});

mailListener.on("server:disconnected", function(){
  console.log("imapDisconnected");
});

mailListener.on("error", function(err){
  console.log(err);
});

mailListener.on("mail", function(mail, seqno, attributes){
    // do something with mail object including attachments
    console.log("HERE'S AN EMAIL --------------------->");

    // Search the email for a UID
    if (mail.text.match(/UID:(.*)--/) !== 'undefined' && mail.text.match(/UID:(.*)--/) != null && mail.text.match(/UID:(.*)--/).length > 0) {
        var parsedUid = mail.text.match(/UID:(.*)--/)[1];
    
        console.log(parsedUid);
    
        // mail processing code goes here
        History.findOneAndUpdate({ uid: parsedUid }, 
        {
            paid: true
        },
        function(err, history) {
            console.log(history);
        });
    }
    
});
