var QRCode = require('qrcode')
 
exports.qrcode = function() {
    return function (req, res) {
        QRCode.toDataURL('I am a pony!', function (err, url) {
            console.log(url)
            
            // Return a response
            res.send(url);
        })
   
    };
};
