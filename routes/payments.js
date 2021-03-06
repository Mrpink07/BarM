var QRCode = require('qrcode')
var drinkshistory = require('./drinkshistory');
 
exports.qrcode = function(History) {
    return function (req, res) {
        QRCode.toDataURL('https://www.mobilepay.dk/erhverv/betalingslink/betalingslink-svar?phone=' + process.env.MOBILE_NUMBER + '&amount=' + req.body.amount + '&comment=UID:' + req.body.uid + '--&lock=1', function (err, url) {
            // Add the drink to the history
            var history = new History(req.body.history);
            history.save(function (err, drink) {
                if (err || !history) {
                    res.json({ error: err });
                }
            });
            // Return a response
            res.send(url);
        });
   
    };
};

exports.status = function(History) {
    return function (req, res) {
        // Get the history entry with the right UID
        History.findOne({ uid: req.body.uid }, function(err, history) {
            res.send(history.paid);
        });
    }
}

exports.cancel = function(History) {
    return function (req, res) {
        // Get the history entry with the right UID
        History.findOneAndUpdate({ uid: req.body.uid }, { cancelled: true }, function(err, history) {
            res.send(history.cancelled);
        });
    }
}
