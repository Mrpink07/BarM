var https = require('https');
const querystring = require('querystring');                                                                                                                                                                                                

// Add to history collection
exports.add = function (History) {
  return function (req, res) {
    console.log(req.body);
    var history = new History(req.body);
    console.log(history);
    history.save(function (err, drink) {
      if (err || !history) {
        res.json({ error: err });
      } else {
        // Send the details off to the remote server
        var postData = querystring.stringify({
            'test': 'Test'
        });
        
        console.log("Contacting API...");
        console.log(history);
        
        var options = {
          hostname: 'barmachina.free.beeceptor.com',
          port: 443,
          path: '/post',
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Content-Length': postData.length
          }
        };
        
        // Send the request
        var httpsReq = https.request(options, (httpsRes) => {
          console.log('statusCode:', httpsRes.statusCode);
          console.log('headers:', httpsRes.headers);
        });
        
        // Handle any errors for the request
        httpsReq.on('error', (e) => {
          console.log('Unable to reach API');
          console.error(e);
        });

        res.json({ history: history });
      }
    });
  };
};

// Log the drink to console
exports.logDrink = function (Drink) {
  return function (req, res) {
    console.log(req.body);
  };
};
