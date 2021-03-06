/* GET edit page */
exports.show = function (Ing) {
  return function (req, res) {
    Ing.find({}, function (err, ings) {
      res.render('editin', {
        title: "Bar Mixvah: Edit Ingredients" ,
        ings: ings,
      });
    });
  };
};

exports.updateIng = function (Ing) {
  return function (req, res) {
    if (req.body.quantityOrig === undefined) req.body.quantityOrig = req.body.quantityMl;
    Ing.findOneAndUpdate({ _id: req.body._id },
      {
        name: req.body.name,
        quantityMl: req.body.quantityMl,
        quantityOrig: req.body.quantityOrig,
        msPerMl: req.body.msPerMl,
        pricePerMl: req.body.pricePerMl
      },
      function (err, ing) {
        if (ing) {
          console.log("Update Ingridient " + ing.name);
          res.send(ing);
        } else {
            console.log("Error with ingredient " + req.body.name);
            console.log(err);
        }
    });
  };
};

exports.updateIngMulti = function (Ing) {
     return function (req, res) {
    console.log("updateIngMulti");
    console.log(req);
//         Ing.findOneAndUpdate({ _id: req.body._id },
//         {
//             name: req.body.name,
//             quantityMl: req.body.quantityMl,
//             quantityOrig: req.body.quantityOrig,
//             msPerMl: req.body.msPerMl
//         },
//         function (err, ing) {
//             if (ing) {
//             console.log("Update Ingridients");
//             res.send(ing);
//             }
//         });
     };
};
