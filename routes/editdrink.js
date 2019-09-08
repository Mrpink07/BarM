var mongoose = require('mongoose');
var path = require('path');     //used for file path
var fs = require('fs');       //File System - for file manipulation

/* GET edit page */
exports.show = function (Drink, Ing, query, res) {
  console.log(query);
  // Set the object ID to use with Mongo
  var objectId = mongoose.Types.ObjectId(query);
  console.log(objectId);
  Drink.find({ _id: objectId }, function (err, drinks) {
    Ing.find({}, function (err, ings) {
      res.render('editdrink', { 
      title: "Bar Mixvah: Edit Drink",
      drink: drinks,
      ings: ings
      });
    });
  });
};

exports.updateDrink = function (Drink) {
  return function (req, res) {
    Drink.findOneAndUpdate({ _id: req.body._id }, 
      {
        name: req.body.name,
        image: req.body.image,
        price: req.body.price,
        ingredients: req.body.ingredients
      }, 
      function (err, drink) {
        if (drink) {
          console.log("Update Drink");
          res.send(drink);
        }
    });
  };
};

exports.uploadImage = function (Drink) {
    return function (req, res) {
        var fstream;
        req.pipe(req.busboy);
        
        req.busboy.on('file', function (fieldname, file, filename) {
            console.log("Uploading: " + filename);
            
            // Set the local filename to use on the server
            var localFile = fieldname;
            localFile = localFile.replace('-image', '');
            
            // Get the file extension
            var ext = filename.split('.').pop();

            //Path where image will be uploaded
            console.log(__dirname + '/../public/images/drinks/' + localFile + '.' + ext);
            fstream = fs.createWriteStream(__dirname + '/../public/images/drinks/' + localFile + '.' + ext);
            file.pipe(fstream);
            fstream.on('close', function () {    
                console.log("Upload Finished of " + localFile + '.' + ext);

                Drink.findOneAndUpdate({ _id: localFile }, 
                {
                    image: localFile + '.' + ext,
                }, 
                function (err, drink) {
                    if (drink) {
                    console.log("Update Drink");
                    res.send(drink);
                    }
                });
                
            });
        });
        res.redirect('back');           //where to go next
    };
};

// Add the QR code - this is basically the same as the image upload but to a different folder
exports.uploadQR = function (Drink) {
    return function (req, res) {
        var fstream;
        req.pipe(req.busboy);
        
        req.busboy.on('file', function (fieldname, file, filename) {
            console.log("Uploading: " + filename);
            
            // Set the local filename to use on the server
            var localFile = fieldname;
            localFile = localFile.replace('-image', '');
            
            // Get the file extension
            var ext = filename.split('.').pop();

            //Path where image will be uploaded
            console.log(__dirname + '/../public/images/qr/' + localFile + '.' + ext);
            fstream = fs.createWriteStream(__dirname + '/../public/images/qr/' + localFile + '.' + ext);
            file.pipe(fstream);
            fstream.on('close', function () {    
                console.log("Upload Finished of " + localFile + '.' + ext);

                Drink.findOneAndUpdate({ _id: localFile }, 
                {
                    qr: localFile + '.' + ext,
                }, 
                function (err, drink) {
                    if (drink) {
                    console.log("Update Drink");
                    res.send(drink);
                    }
                });
                
            });
        });
        res.redirect('back');           //where to go next
    };
};
