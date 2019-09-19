var QRCode = require('qrcode')
 
exports.qrcode = function() {
    return function (req, res) {
        QRCode.toDataURL('https://www.mobilepay.dk/erhverv/betalingslink/betalingslink-svar?phone=123456798&amount=' + req.body.amount + '&comment=' + req.body.uid + '&lock=1', function (err, url) {
            // Return a response
            res.send(url);
        })
   
    };
};
