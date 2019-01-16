
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
