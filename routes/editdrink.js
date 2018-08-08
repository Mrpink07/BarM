var mongoose = require('mongoose');

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
