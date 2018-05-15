var Readable = require("stream").Readable;
var util = require("util");
util.inherits(MyStream, Readable);
function MyStream(opt) {
  Readable.call(this, opt);
}
MyStream.prototype._read = function() {};
// hook in our stream
process.__defineGetter__("stdin", function() {
  if (process.__stdin) return process.__stdin;
  process.__stdin = new MyStream();
  return process.__stdin;
});

var board, pump0, pump1, pump2, pump3, pump4;

var five = require('johnny-five');

board = new five.Board();
board.on('ready', function () {
  // Counting down pins because that's the orientation
  // that my Arduino happens to be in
  pump0 = new five.Relay({
  pin: 3,
  type: "NC",
  isOn: true,

});
  pump1 = new five.Relay({
  pin: 6,
  type: "NC",
  isOn: true,
});
  pump2 = new five.Relay({
  pin: 5,
  type: "NC",
  isOn: true,
});
  pump3 = new five.Relay({
  pin: 4,
  type: "NC",
  isOn: true,
});
  pump4 = new five.Relay({
  pin: 12,
  type: "NC",
  isOn: true,
});
pump5 = new five.Relay({
pin: 10,
type: "NC",
isOn: true,
});
pump6 = new five.Relay({
pin: 7,
type: "NC",
isOn: true,
});
  pump7 = new five.Relay({
  pin: 2,
  type: "NC",
  isOn: true,
});
  pump8 = new five.Relay({
  pin: 8,
  type: "NC",
  isOn: true,
});
pump9 = new five.Relay({
pin: 9,
type: "NC",
isOn: true,
});
  board.repl.inject({
    p0: pump0,
    p1: pump1,
    p2: pump2,
    p3: pump3,
    p4: pump4,
      p5: pump5,
      p6: pump6,
      p7: pump7,
      p8: pump8,
      p9: pump9,



  });
pump0.open();
pump1.open();
pump2.open();
pump3.open();
pump4.open();
pump5.open();
pump6.open();
pump7.open()
pump8.open();
pump6.open();
pump9.open();
  console.log("\033[31m[MSG] Bar Machina Klar\033[91m");
});

exports.pump = function (ingredients) {
  console.log("Dispensing Drink");
  for (var i in ingredients) {
    (function (i) {
      setTimeout(function () {  // Delay implemented to have a top-biased mix
        pumpMilliseconds(ingredients[i].pump, ingredients[i].amount);
      }, ingredients[i].delay);
    })(i);
  }
};

function pumpMilliseconds(pump, ms) {
  console.log("Pump " + pump + " will run for " + ms + " ms");
  exports.startPump(pump);
  setTimeout(function () {
    exports.stopPump(pump);
  }, ms);
}

exports.startPump = function (pump) {
  console.log("\033[32m[PUMP] Starting " + pump + "\033[91m");
  var p = exports.usePump(pump);
  p.on();
}

exports.stopPump = function (pump) {
  console.log("\033[32m[PUMP] Stopping " + pump + "\033[91m");
  var p = exports.usePump(pump);
  p.off();
}

exports.usePump = function (pump) {
  var using;
  switch(pump) {
    case 'pump0':
      using = pump0;
      break;
    case 'pump1':
      using = pump1;
      break;
    case 'pump2':
      using = pump2;
      break;
    case 'pump3':
      using = pump3;
      break;
    case 'pump4':
      using = pump4;
      break;
      case 'pump5':
        using = pump5;
        break;
        case 'pump6':
          using = pump6;
          break;
          case 'pump7':
            using = pump7;
            break;
            case 'pump8':
              using = pump8;
              break;
              case 'pump9':
                using = pump9;
                break;
    default:
      using = null;
      break;
  }
  return using;
}
