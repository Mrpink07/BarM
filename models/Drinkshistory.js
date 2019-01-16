var Mongoose = require('mongoose');

exports.HistorySchema = new Mongoose.Schema({
  name: { type: String, required: true },
  besk: { type: String, required: false },
  image: { type: String, required: false },
  measurement: { type: String, required: false, default: 'pc' },
  price: { type: Number, required: false },
  drinkSize: { type: String, required: false },
  date: { type: Date, default: Date.now },
  ingredients: [{
    name: String,
    amount: Number,
    pump: String
  }]
});
