var Mongoose = require('mongoose');

exports.DrinkSchema = new Mongoose.Schema({
  name: { type: String, required: true },
  besk: { type: String, required: false },
  image: { type: String, required: false },
  measurement: { type: String, required: false },
  price: { type: Number, required: false },
  ingredients: [{
    name: String,
    amount: Number,
    amountSmall: Number,
    amountMedium: Number,
    amountLarge: Number,
    delay: Number
  }]
});
