var socket = io.connect();
var $scope; 

$(document).ready(function () {
  $scope = angular.element($('#drinkScope')).scope();

  // Initialize
  resizeCover($(window));
  hideControls();
  resizeContainers();
  
  // Sizing
  window.onresize = function () {
    resizeCover($(window));
    resizeContainers();
  };

  $('.mixers').on('change click touch blur', function () {
    resizeContainers();
  });

  // Front end drink making
  $('#make').on('click touch', function () {
    if ($('#make').hasClass('noselection') === true) {
      alert('Please select a drink first.');
      return;
    }

    if ($('#make').hasClass('disabled') === true) {
      return;
    }

    // Visual goodies
    console.log('Making Drink');
    $('#make').addClass('disabled');
    $('#makeProgress').show();

    var drinkEstimatedTimeOfArrival = Date.now() + $scope.pumpTime;

    setTimeout(function(){
        console.log("Time to Dispense Drink: " + $scope.pumpTime + "ms");

        var pourProgress = document.getElementById('pourProgress').ldBar;
        pourProgress.set(0);

        $('#pourProgress').animate({
            'data-value': 100
        }, {
          duration: parseInt($scope.pumpTime),
          easing: 'linear',
          progress: function(animation, progress, remainingMs){
            pourProgress.set(Math.ceil(progress*100));
          },
          done: function () {
              $('#make').removeClass('disabled');
              pourProgress.set(0);
          }});
    }, 200);

    setTimeout(function () {
      console.log("Time to Dispense Drink: " + $scope.pumpTime + "ms");
      $('#makeProgress').animate({
        'margin-left': String($(window).width()) + 'px'
      }, parseInt($scope.pumpTime), 'linear', function () {
        $('#make').removeClass('disabled');
        $('#makeProgress').hide();
        $('#makeProgress').css('margin-left', '-10px');
      });
    }, 200);

    // Start dispensing drink
    makeDrink($scope.selectedDrink, $scope.selectedDrink.ingredients, $scope.pumps, parseInt($scope.drinkSize));
  });
  
  // $('.drinkName').mouseover(function () {
  //   $(this).parent().parent().children('.hiddenIngredientFloat').show();
  //   $(this).parent().parent().fadeTo(0, 0.8);
  // });

  // $('.drinkName').mouseout(function () {
  //   $(this).parent().parent().children('.hiddenIngredientFloat').hide();
  //   $(this).parent().parent().fadeTo(0, 1.0);
  // });
  
  $('.drinkSize').on('click touch', function () {
    $('.drinkSize').each(function () {
      $(this).removeClass('selectedSize');
    });
    $(this).addClass('selectedSize');
  });

  var pumpControlsVisible = false;
  $('#pumpControlToggle').on('click touch', function () {
    if (pumpControlsVisible) {
      pumpControlsVisible = false;
      $('#hiddenPumpControls').hide();
      $('#plusMinus').hide();
      $(this).text("PUMP");
      $(this).removeClass("active");
    } else {
      pumpControlsVisible = true;
      $('#hiddenPumpControls').show();
      $('#plusMinus').show();
      $(this).text("x");
      $(this).addClass("active");
    }
  });

  $('.singlePump').on('click touch', function () {
    var pump = "pump" + $(this).index();
    console.log(pump);
    if ($(this).hasClass('active')) {
      stopOnePump($(this));
    } else {
      startOnePump($(this));
    }
  });
    
  $('#allPumps').on('click touch', function () {
    var children = $('#hiddenPumpControls').children();
    
    if ($(this).hasClass('active')) {
      $(this).text('All');
      children.each(function () {
        if ($(this).index() === children.length-1) {
          $(this).text('All');
          $(this).removeClass('active');
        } else {
          stopOnePump($(this))
        }
      });
    } else {
      $(this).text('Stop');
      children.each(function () {
        if ($(this).index() === children.length-1) { 
          $(this).addClass('active');
        } else {
          startOnePump($(this));
        }
      });
    }
  });

  // setInterval(function () {
  //   resizeContainers();
  // }, 500);
});

function resizeCover(view) {
  //todo remove this - kuba
  // $('#cover').height(view.height());
  // $('#cover').css('padding-top', String(view.height()/2-140) + "px")
}

function hideControls() {
  $('#makeProgress').hide();
  // $('.hiddenIngredientFloat').each(function () {
  //   $(this).hide();
  // });
  $('#hiddenPumpControls').hide();
  $('#plusMinus').hide();
}

function resizeContainers() {
  $('.drinkContainer').each(function () {
    var size = $(this).width();
    $(this).height(size);

    var label = $(this).children('.drinkImage').children('.drinkName');
    var margin = size - label.height() - 20;
    label.css('margin-top', margin);
  });
}

function animateBackground() {
  $('#make').animate({backgroundColor:'#FFFFFF'}, 1000, 'swing', function () {
    $('#make').animate({backgroundColor: '#c0392b'}, 1000, 'swing', function () {
      animateBackground();
    });
  });
}

function makeDrink(drink, ingredients, pumps, drinkSize) {
  // Check that there are no duplicate pumps ingredients
  if ($scope.pumpDuplicates > 0) {
    alert("Pump values must be unique");
    return;
  }
  
  // Reset the pump time
  $scope.pumpTime = 0;

  // Work out how long each ingredient should be poured for, based on the ml value
  var msPerMl = 125; // This is how long it takes to pour 1 ml

  // Create a temp variable to stor the ingredients
  var origIngredients = ingredients;

  // If the measurement is percent
  if (drink.measurement == "pc" || !drink.measurement) {
    // Go through all of the ingredients
    console.log("Measuring using %");
    for (var i in ingredients) {
      // Convert the percentage values to ml based on the drink size
      ingredients[i].amount = drinkSize * Number(ingredients[i].amount);
      console.log(ingredients[i].name + ": " + ingredients[i].amount + " ml");

      // Convert the amount into milliseconds
      ingredients[i].amount = ingredients[i].amount * msPerMl;
      console.log(ingredients[i].name + ": " + ingredients[i].amount + " ms");
      
      // Increase the total pump time to add on the amount for this ingredient
      $scope.pumpTime += ingredients[i].amount;
      
      // Append pump numbers to the ingredients
      for (var j in pumps.ingredients) {
        if (ingredients[i].name === pumps.ingredients[j].ingredient) {
          ingredients[i].pump = pumps.ingredients[j].label;
          continue;
        }
      }
      
      // Put the ingredients back how they were
      //ingredients[i].amount = ingredients[i].amount / msPerMl;
      //ingredients[i].amount = ingredients[i].amount / drinkSize;
    }
  } else if (drink.measurement == "ml") {
  // If the measurement is ml
    for (var i in ingredients) {
      // Set the amount size based on the selected drink size
      switch (drinkSize) {
        case 40:
          var amountSize = 'amountSmall';
          break;
        case 200:
          var amountSize = 'amountMedium';
          break;
        case 400:
          var amountSize = 'amountLarge';
          break;
      }

      // Write the number of ml to the console
      console.log(ingredients[i].name + ": " + ingredients[i][amountSize] + " ml");            

      // Get the amount value (ml) and multiply it to get the number of ms the pump should run for that ingredient
      ingredients[i][amountSize] = Number(ingredients[i][amountSize]) * msPerMl;
      console.log(ingredients[i].name + ": " + ingredients[i][amountSize] + " ms");
      
      // Increase the total pump time to add on the amount for this ingredient
      $scope.pumpTime += ingredients[i][amountSize];
      
      // Append pump numbers to the ingredients
      for (var j in pumps.ingredients) {
        if (ingredients[i].name === pumps.ingredients[j].ingredient) {
          ingredients[i].pump = pumps.ingredients[j].label;
          continue;
        }
      }
      
      // Put the ingredients back how they were
      //ingredients[i][amountSize] = ingredients[i][amountSize] / msPerMl;
    }      
  } 



/*
// TODO: Remove old code after testing
//   // Get largest amount and index of that ingredient
//   var largestAmount = 0;
//   var amountTotal = 0;
//   var largestIndex = 0;
  for (var i in ingredients) {
//     amountTotal += Number(ingredients[i].amount);
//     if (Number(ingredients[i].amount) > largestAmount) {
//       largestAmount = ingredients[i].amount;
//       largestIndex = i;
//     }
// 
    // Get the amount value (ml) and multiply it to get the number of ms the pump should run for that ingredient
    ingredients[i].amount = Math.floor(Number(ingredients[i].amount) * msPerMl);
    console.log(ingredients[i].name + ": " + ingredients[i].amount + " ms");
    
    // Increase the total pump time to add on the amount for this ingredient
    $scope.pumpTime += ingredients[i].amount;
    
    // Append pump numbers to the ingredients
    for (var j in pumps.ingredients) {
      if (ingredients[i].name === pumps.ingredients[j].ingredient) {
        ingredients[i].pump = pumps.ingredients[j].label;
        continue;
      }
    }
  }
// 
//   // Normalize
//   var normFactor = drinkSize/amountTotal;
// 
//   var totalPumpMilliseconds = parseInt(normFactor * largestAmount); 
//   $scope.pumpTime = totalPumpMilliseconds;
// 
//   // Set the normalized amount and delay for each ingredient
//   ingredients[largestIndex].amount = parseInt(normFactor * Number(ingredients[largestIndex].amount));
//   ingredients[largestIndex].delay = 0;
//   for (var i in ingredients) {
//     if (i === largestIndex) continue;
//     ingredients[i].amount = parseInt(normFactor * Number(ingredients[i].amount));
//     ingredients[i].delay = ingredients[largestIndex].amount - ingredients[i].amount;
//   }
*/  
  
  socket.emit("Make Drink", ingredients);
}

function startOnePump(self) {
  self.text("Stop");
  self.addClass('active');
  socket.emit('Start Pump', "pump"+self.index());
}

function stopOnePump(self) {
  self.text(self.index());
  self.removeClass('active');
  socket.emit('Stop Pump', "pump"+self.index());
}
