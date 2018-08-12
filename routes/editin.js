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
    Ing.findOneAndUpdate({ _id: req.body._id },
      {
        name: req.body.name,
        quantityMl: req.body.quantityMl,
        quantityOrig: req.body.quantityOrig,
        msPerMl: req.body.msPerMl
      },
      function (err, ing) {
        if (ing) {
          console.log("Update Ingridients");
          res.send(ing);
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
