var socket = io.connect();
var $scope; 

var msPerMl = 125; // This is how long it takes to pour 1 ml

// Payment cancel function
function cancelPayment() {
    // Update the drinks history schema
    $.post('/paymentCancel.json', { uid: $scope.selectedDrink.drinkId }).success(function (data) {
        if(data)
            $('#cancel-btn').html('<img src="/images/spinner.gif" />');
            setTimeout(function() { location.reload(); }, 1000);
    });
}


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
  
  // Set the original delay for each ingredient
/*  var allDrinks = $scope.drinks;
  for (var d in allDrinks) {
    
    // Go through the ingredients for the current drink
    var thisIngredients = allDrinks[d].ingredients;
    for (var i in thisIngredients) {
      thisIngredients[i].delayOrig = thisIngredients[i].delay; // Set the delayOrig field with the original delay
      thisIngredients[i].amountOrig = thisIngredients[i].amount; // Set the amountOrig field with the original amount      
    }
  }
*/
    // Function for creating UIDs
    var UID = function () {
    // Math.random should be unique because of its seeding algorithm.
    // Convert it to base 36 (numbers + letters), and grab the first 9 characters
    // after the decimal.
    return Math.random().toString(36).substr(2, 9);
    };
    

  // Front end drink making
  $('#make').on('click touch', function () {
    if ($('#make').hasClass('noselection') === true) {
      alert('Please select a drink first.');
      return;
    }
    
    // Check that a drink size has been selected
    if ($('.drinkSize').hasClass('selectedSize') === false) {
      alert('Please select a size.');
      return;
    }

    if ($('#make').hasClass('disabled') === true) {
      return;
    }

    // Get an ID for this drink
    $scope.selectedDrink.drinkId = UID();

    // Set up the object for the drink history
    var history = {};
    history.name = $scope.selectedDrink.name;
    history.image = $scope.selectedDrink.image;
    history.measurement = $scope.selectedDrink.measurement;
    history.price = $scope.selectedDrink.price;
    history.ingredients = $scope.selectedDrink.ingredients;
    history.drinkSize = $scope.drinkSize;
    history.uid = $scope.selectedDrink.drinkId;

    // Show the overlay while we get the QR code
    $('.payment-overlay').show();
    
    // Get the QR Code
    $.post('/qrcode.json', { amount: $scope.selectedDrink.price, uid: $scope.selectedDrink.drinkId, history: history }).success(function (data) {
        $('.payment-qr').attr('src', data);

        // Check the payment status
        checkStatus();
    });
  });
  
  // Check payment status on a loop
  function checkStatus() {
    // Check the payment status
    $.post('/paymentStatus.json', { uid: $scope.selectedDrink.drinkId }).success(function (data) {
        // If the result was false then check again in a few secs
        console.log(data);
        if (data === false) {
            setTimeout(function() { checkStatus(); }, 3000);
        } else {
            console.log("POUR!");
            $('.payment-overlay').hide();
            pourThatDrink();
        }
    });
  }
  
  function pourThatDrink() {
    // Visual goodies
    console.log('Making Drink');
    $('#make').addClass('disabled');
    $('#makeProgress').show();
    
    // Go through and get the original values for the ingredients
    getOriginalValues();

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
              //location.reload(); // Reloading the page will reset the ingredient values
              $('#make').removeClass('disabled');
              //$('#make').addClass('noselection');
              pourProgress.set(0);
              console.log("Drink has finished pouring");
              
//               // Update the ingredient quantities
//               for (i in $scope.newIngs) {
//                 $.post('/updateing.json', $scope.newIngs[i]).success(function (data) {
//                     console.log("Successfully updated ingredient quantity for " + $scope.newIngs[i].name);
//                     console.log(data);
//                 });
//               }

              
              // Go through all of the ingredients that have just been used
              var ingredients = $scope.selectedDrink.ingredients
              for (var i in ingredients) {
                console.log(ingredients[i].name + ": " + ingredients[i].amount);
                
                if ($scope.selectedDrink.measurement == 'pc' || !$scope.selectedDrink.measurement) {
                    // Convert amount back to the original
                    ingredients[i].amount = ingredients[i].amountOrig;
                    console.log(ingredients[i].name + ": " + ingredients[i].amount);
                } else if ($scope.selectedDrink.measurement == "ml") {
                    // Set the amount size based on the selected drink size
                    var drinkSize = parseInt($scope.drinkSize);
                    console.log("Drink size: " + drinkSize);
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
                    console.log(ingredients[i].name + ": " + ingredients[i][amountSize] + " ms");

                    // Get the amount and convert it back to ml
                    ingredients[i].amount = Number(ingredients[i][amountSize]);
                }
                
                // Reset the delay
                ingredients[i].delay = ingredients[i].delayOrig; 
              }
              
              if ($scope.ingWarning) {
                  // If we've run out of an ingredient then reload the page
                  $.post('/email.json', { name: $scope.ingWarningName }).success(function (data) {
                      console.log("Warning email sent for " + $scope.ingWarningName);
                      console.log(data);
                      location.reload();
                  });
              }
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
    makeDrink($scope.selectedDrink, $scope.selectedDrink.ingredients, $scope.pumps, parseInt($scope.drinkSize), $scope.ings);
  }
  
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

function getOriginalValues () {
  // Set the original delay for each ingredient
  var allDrinks = $scope.drinks;
  for (var d in allDrinks) {
      
    // Go through the ingredients for the current drink
    var thisIngredients = allDrinks[d].ingredients;
    for (var i in thisIngredients) {
      thisIngredients[i].delayOrig = thisIngredients[i].delay; // Set the delayOrig field with the original delay
      thisIngredients[i].amountOrig = thisIngredients[i].amount; // Set the amountOrig field with the original amount      
    }
  }
}

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

function makeDrink(drink, ingredients, pumps, drinkSize, ings) {
  // Check that there are no duplicate pumps ingredients
  if ($scope.pumpDuplicates > 0) {
    alert("Pump values must be unique");
    return;
  }
    
  // Reset the pump time
  $scope.pumpTime = 0;

  // Work out how long each ingredient should be poured for, based on the ml value
  //var msPerMl = 125; // This is how long it takes to pour 1 ml

  // Create a temp variable to stor the ingredients
  $scope.selectedDrink.origIngredients = ingredients;

  // If the measurement is percent
  if (drink.measurement == "pc" || !drink.measurement) {
    // Go through all of the ingredients
    console.log("Measuring using %");
    
    // Capture updated ingredient info
    $scope.newIngs = [];
    
    for (var i in ingredients) {
      // Convert the percentage values to ml based on the drink size
      ingredients[i].amount = drinkSize * Number(ingredients[i].amount);
      console.log(ingredients[i].name + ": " + ingredients[i].amount + " ml");
      
      // Get the msPerMl value from the ings array
      for (var x in ings) {
          if (ings[x].name == ingredients[i].name) {
            msPerMl = ings[x].msPerMl;
            
            // Check there is enough ingredient for this size of drink
            if (ingredients[i].amount >= ings[x].quantityMl) {
                alert("There aren't enough ingredients to make that drink. Please choose a smaller size.\nDer er ikke nok ingredienser til at drikke. Vælg venligst en mindre størrelse.");
                return false;
            }

            ings[x].quantityMl = parseInt(ings[x].quantityMl - ingredients[i].amount);
            console.log(ingredients[i].name + ' new qty ' + parseInt(ings[x].quantityMl - ingredients[i].amount) + 'ml');
            $scope.newIngs.push(ings[x]);
            
            // Check if we're running out of the ingredient
            if (ings[x].quantityMl < (ings[x].quantityOrig * 0.1)) {
              $scope.ingWarning = true;
              $scope.ingWarningName = ings[x].name;
            }
          }
      }

      // Convert the amount into milliseconds
      ingredients[i].amount = ingredients[i].amount * msPerMl;
      console.log(ingredients[i].name + ": " + ingredients[i].amount + " ms");

      // The total pump time will be the time the largest ingredient takes to pour
      if (ingredients[i].amount > $scope.pumpTime) $scope.pumpTime = ingredients[i].amount;
      
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
      
    // Capture updated ingredient info
    $scope.newIngs = [];

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

      // Get the msPerMl value from the ings array
      for (var x in ings) {
          if (ings[x].name == ingredients[i].name) {
            msPerMl = ings[x].msPerMl;

            // Check there is enough ingredient for this size of drink
            if (ingredients[i][amountSize] >= ings[x].quantityMl) {
                alert("There aren't enough ingredients to make that drink. Please choose a smaller size.\nDer er ikke nok ingredienser til at drikke. Vælg venligst en mindre størrelse.");
                return false;
            }

            ings[x].quantityMl = parseInt(ings[x].quantityMl - ingredients[i][amountSize]);
            console.log(ingredients[i].name + ' new qty ' + parseInt(ings[x].quantityMl - ingredients[i][amountSize]) + 'ml');
            $scope.newIngs.push(ings[x]);
            
            // Check if we're running out of the ingredient
            if (ings[x].quantityMl < (ings[x].quantityOrig * 0.1)) {
              $scope.ingWarning = true;
              $scope.ingWarningName = ings[x].name;
            }
          }
      }
      
      // Get the amount value (ml) and multiply it to get the number of ms the pump should run for that ingredient
      ingredients[i].amount = Number(ingredients[i][amountSize]) * msPerMl;
      console.log(ingredients[i].name + ": " + ingredients[i].amount + " ms");
      
      // The total pump time will be the time the largest ingredient takes to pour
      if (ingredients[i].amount > $scope.pumpTime) $scope.pumpTime = ingredients[i].amount;
      
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

  // Set a variable for the largest delay value
  var largestDelay = 0;

  // Now go through the delays and set a ms value for those
  for (var i in ingredients) {
    if (i > 0) console.log("Prev ing: " + ingredients[i].amount);
    ingredients[i].delay = (Number(ingredients[i].delay) / 100) * $scope.pumpTime;
    console.log("Delay for " + ingredients[i].name + ": " + ingredients[i].delay + " ms");
    if (ingredients[i].delay > largestDelay) largestDelay = ingredients[i].delay; // Set the largest delay
  }
  
  // Next go through the ingredients again and now see what the biggest amount + delay value is
  for (var i in ingredients) {
      if (ingredients[i].amount + ingredients[i].delay > $scope.pumpTime) $scope.pumpTime = ingredients[i].amount + ingredients[i].delay;
      console.log("Total pump time changed to " + $scope.pumpTime);
  }
  
  
    // Update the ingredient quantities
    for (i in $scope.newIngs) {
        $.post('/updateing.json', $scope.newIngs[i]).success(function (data) {
            console.log("Successfully updated ingredient quantity for " + $scope.newIngs[i].name);
            console.log(data);
        });
    }
    

//     // Set up the object for the drink history
//     var history = {};
//     history.name = $scope.selectedDrink.name;
//     history.image = $scope.selectedDrink.image;
//     history.measurement = $scope.selectedDrink.measurement;
//     history.price = $scope.selectedDrink.price;
//     history.ingredients = $scope.selectedDrink.ingredients;
//     history.drinkSize = $scope.drinkSize;
    
//     console.log(history);
// 
//     $.post('/adddrinkhistory.json', history).success(function (data) {
//         console.log("Successfully updated ingredient quantity for " + $scope.newIngs[i].name);
//         console.log(data);
//     });

    
  // Add the largest delay onto the total time
  //$scope.pumpTime = $scope.pumpTime + largestDelay;


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
