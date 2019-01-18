var mongoose = require('mongoose');
var path = require('path');     //used for file path
var fs = require('fs');       //File System - for file manipulation

/* GET history page */
exports.show = function (History) {
  return function (req, res) {
    History.find({}, function (err, histories) {
      res.render('historypage', { 
        title: "Bar Mixvah: Drinks History" ,
        histories: histories,
      });
      console.log(histories);
    });
  };
};
