var mongoose = require('mongoose');
var busboy = require('connect-busboy'); //middleware for form/file upload
var path = require('path');     //used for file path
//var fs = require('fs-extra');       //File System - for file manipulation

/* GET edit page */
exports.show = function (Drink, query, res) {
  console.log(query);
  // Set the object ID to use with Mongo
  var objectId = mongoose.Types.ObjectId(query);
  console.log(objectId);
  Drink.find({ _id: objectId }, function (err, drinks) {
    res.render('editdrink', { 
      title: "Bar Mixvah: Edit Drink",
      drink: drinks,
    });
  });
};

exports.updateDrink = function (Drink) {
  return function (req, res) {
    Drink.findOneAndUpdate({ _id: req.body._id }, 
      {
        name: req.body.name,
        image: req.body.image,
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
        console.log(req);
    };
};