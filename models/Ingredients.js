var Mongoose = require('mongoose');

exports.IngredientsSchema = new Mongoose.Schema({
  name: { type: String, unique: true, sparse: true, required: true },
  quantityMl: { type: Number, required: true },
  quantityOrig: { type: Number, required: false },
  msPerMl: {type: Number, required: true },
  pricePerMl: {type: Number, required: false},
});
