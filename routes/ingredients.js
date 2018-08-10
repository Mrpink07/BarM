/* GET ingredients page */
exports.show = function (Drink) {
  return function (req, res) {
    Drink.find({}, function (err, drinks) {
      res.render('ingredients', { 
        title: "Bar Mixvah: Edit Ingredients" ,
        drinks: drinks,
      });
    });
  };
};

exports.updateIngredient = function (Drink) {
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
