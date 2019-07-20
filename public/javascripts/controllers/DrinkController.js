function DrinkController($scope, $http) {
  $scope.drinks = [];
  $scope.newDrink = {
    name: '',
    image: '',
    measurement: '',
    ingredients: [
      { name: '', amount: 0, delay: 0 }
    ]
  };

  $scope.ings = [];
  $scope.newIng = {
    name: '',
    quantityMl: '',
    msPerMl: '',
    pricePerMl: ''
  };

  $scope.pumps = {
    label: "pumps",
    ingredients: [
      { label: "pump0", ingredient: "" }
    ]
  };

  $scope.sizes = [
    { size: '40', time: '480' },
    { size: '200', time: '25000' },
    { size: '400', time: '48000' }
  ];

  $scope.selectedDrink;
  $scope.drinkTime = 10000;
  $scope.pumpTime = 0;

  $scope.pumpDuplicates = 0;

//   $scope.ingredientsList = [
//     'Vodka', 'Rum', 'Whiskey', 'Tequila', 'Gin', 'Sake', 'Soju',
//     'Orange Juice', 'Apple Juice', 'Cranberry Juice', 'Pineapple Juice', 'Mango Juice', 'Grapefruit Juice', 'Lime Juice',
//     'Coke', 'Sprite', 'Ginger Ale', 'Root Beer', 'Dr. Pepper',
//     'Blue Liqueur', 'Sweet & Sour', 'Triple Sec', 'Kaluha', 'Peach Schnapps', 'Midori Melon',
//     'Champagne', 'Vand', 'Granene', 'blue cuck', 'Vermouth', 'Milk', 'Cuba', 'Tonic', 'Hyldeblomst', 'Tranebaer', 'Dansk Vand', 'AebleJuice',
// 'Danskvand', 'Solbaer', 'Danskvand med citrus','citron', 'hyldebaetr', 'ingefaer', 'Multi Frugt' , 'Ribs', 'Jordbaer', 'Granataeble',
//   ];

 
//  $scope.ingredientsList = ings.name;
  console.log($scope.ingredientsList);

  $scope.setDrinks = function (drinks, ings) {
    $scope.drinks = drinks;
    
    // Now go through all of the drinks and check we have the ingredients
    for(i in $scope.drinks) {
      for (j in $scope.drinks[i].ingredients) {
        for (x in ings) {
          if (ings[x].name == $scope.drinks[i].ingredients[j].name) {
            if (ings[x].quantityMl < (ings[x].quantityOrig * 0.1)) $scope.drinks[i].noIngs = true;
          }
        }
      }
    }
  };

  $scope.setIngs = function (ings) {
    $scope.ings = ings;
    
    // Make a list of the ingredients
    $scope.ingredientsList = [];
    for (var i = 0; i < ings.length; i++) {
        $scope.ingredientsList.push(ings[i].name);
    }
    
    console.log($scope.ingredientsList);
  };

  $scope.initializePumps = function () {
    console.log('ran');
    $http.post('/initializePumps').success(function (data) {
      console.log(data);
      return data;
    });
  };

  $scope.setPumps = function (pumps) {
    $scope.pumps = pumps[0];
  };

  $scope.getPumps = function () {
    $http.get('/pump.json').success(function (data) {
      console.log(data);
      return data;
    });
  };

  $scope.addPump = function () {
    var index = 0;
    if (typeof $scope.pumps === 'undefined') {
      $scope.pumps = {
        label: "pumps",
        ingredients: [ { label: "pump0", ingredient: "" } ]
      }
    } else {
      index = $scope.pumps.ingredients.length;
      $scope.pumps.ingredients.push({ label: "pump" + String(index), ingredient: "" });
    }

    $http.post('/updatepump.json', $scope.pumps).success(function (data) {
      console.log("addPump Update Success");
      console.log($scope.pumps);
    });
  };

  $scope.removePump = function () {
    $scope.pumps.ingredients.pop();
    $http.post('/updatepump.json', $scope.pumps).success(function (data) {
      console.log("removePump Update Success");
    });
  };

  $scope.savePumpValue = function (pumpNumber) {
    $http.post('/updatepump.json', $scope.pumps).success(function (data) {
      if (data) {
        console.log(data);
      }
    });
  };

  $scope.selectDrink = function (drink) {
    //console.log('select', arguments, this);
    $scope.selectedDrink = drink;

    if ($scope.lastSelected) {
      $scope.lastSelected.selectedDrink = '';
    }

    this.selectedDrink = 'selectedDrink';
    $scope.lastSelected = this;

    // Check if any of the size buttons need to be disabled
    $scope.checkSizesAvailable(drink);
  };

  // Check which sizes are available from the drink's settings, and disable any buttons that aren't available
  $scope.checkSizesAvailable = function (drink) {
      console.log(drink);
  };

  $scope.selectSize = function (size) {
    for (var i in $scope.sizes) {
      if ($scope.sizes[i].size === size) {
        $scope.drinkTime = $scope.sizes[i].time;
	$scope.drinkSize = $scope.sizes[i].size;
        return;
      }
    }
  };

  $scope.addNewDrink = function () {
    $http.post('/drink.json', $scope.newDrink).success(function (data) {
      console.log(data.drink);
      console.log($scope);
      console.log('Success - Add drink');
      window.location.href = '#';
      $('.drink-success').show();
      if (data.drink) {
        $scope.drinks.push(data.drink);
        $scope.newDrink = {
          name: '',
          image: '',
          price: '',
          ingredients: [
            { name: '', amount: 0 }
          ]
        };
      } else {
        alert(JSON.stringify(data));
      }
    });
  };

  $scope.addNewIngredient = function () {
    $scope.newDrink.ingredients.push({ name: '', amount: 0, delay: 0 });
    console.log('Added new ingredient');
  };

  $scope.removeIngredient = function (index) {
    $scope.newDrink.ingredients.splice(index, 1);
    console.log('Removed ingredient at index ' + index);
  };

  // These functions are similar to the ones above, but to be used on the editdrink page
  $scope.addNewIngredientEdit = function () {
  console.log($scope);
    $scope.drinks.ingredients.push({ name: '', amount: 0, delay: 0 });
    console.log('Added new ingredient');
  };

  $scope.removeIngredientEdit = function (index) {
    $scope.drinks.ingredients.splice(index, 1);
    console.log('Removed ingredient at index ' + index);
  };

  // Filter for drinks
  $scope.containsIngredients = function (drink) {
    var numIngredients = drink.ingredients.length;
    var numPumps = $scope.pumps.ingredients.length;
    var ingredientsContained = 0 - $scope.pumpDuplicates;
    for (var i = 0; i < numIngredients; i++) {
      for (var j = 0; j < numPumps; j++) {
        if (drink.ingredients[i].name === $scope.pumps.ingredients[j].ingredient) {
          ingredientsContained++;
          if (ingredientsContained >= numIngredients && ingredientsContained <= numPumps) {
            return true;
          }
          continue;
        }
      }
    }
    return false;
  };

  // Check if there are duplicate pump ingredients before dispensing drinks
  /*$scope.checkDuplicates = function () {
    var len = $scope.pumps.ingredients.length;
    for (var i = 0; i < len; i++) {
      for (var j = i+1; j < len; j++) {
        if ($scope.pumps.ingredients[i].ingredient === $scope.pumps.ingredients[j].ingredient) {
          return false;
        }
      }
    }
    return true;
  };*/


  $scope.writeNumDuplicates = function () {
    var dupCount = 0;
    var len = $scope.pumps.ingredients.length;
    for (var i = 0; i < len; i++) {
      for (var j = i+1; j < len; j++) {
        if ($scope.pumps.ingredients[i].ingredient === $scope.pumps.ingredients[j].ingredient) {
          dupCount++;
        }
      }
    }
    $scope.pumpDuplicates = dupCount;
    //return dupCount;
  };

  $scope.editDrink = function (drink) {
    console.log(drink);
    $http.post('/updatedrink.json', drink).success(function (data) {
      console.log("Success - Drink Edit");
      console.log(data);
      window.location.href = '#';
      $('.drink-success').show();
    });
  };

  // Add a new ingredient into the database
  $scope.addNewIng = function () {
    $http.post('/ing.json', $scope.newIng).success(function (data) {
      console.log(data.ing);
      console.log($scope);
      console.log('Success - Ing added');
      window.location.href='#';
      $('.ing-success').show();
      if (data.ing) {
        $scope.ings.push(data.ing);
        $scope.newIng = {
          name: '',
          quantityMl: '',
          msPerMl: '',
          pricePerMl: ''
        };
      } else {
        alert(JSON.stringify(data));
      }
    });
  };

  $scope.editIng = function (ing) {
    // Update the quantityOrig value
    ing.quantityOrig = ing.quantityMl;
    console.log(ing);
    $http.post('/updateing.json', ing).success(function (data) {
      window.location.href='#';
      $('.ing-success').show();
      console.log("Success");
      console.log(data);
    });
  };
  
  // Button to increase the ingredient delay
  $scope.increaseDelay = function (ingredient) {
      console.log(ingredient);
      ingredient.delay = parseInt(ingredient.delay) + 10;
  };

  // Button to decrease the ingredient delay
  $scope.decreaseDelay = function (ingredient) {
      console.log(ingredient);
      ingredient.delay -= 10;
      // Don't go below 0 though
      if (ingredient.delay < 0) ingredient.delay = 0;
  };
  
  // Handle uploaded images
  $scope.uploadFile = function(files, drink) {
      var fd = new FormData();
      //Take the first selected file
      fd.append("file", files[0]);
      
      console.log(fd);
      console.log(drink);

      $http.post('/uploadimage.json', fd, {
          withCredentials: true,
          headers: {'Content-Type': undefined },
          transformRequest: angular.identity
      }).success( function() {
        //console.log(fd);
      })
      .error( function(err) {
        console.log(err)
      });

  };
  
  // Return how much of an ingredient is left
  $scope.getIngQuantity = function(name, ings) {
      for (i in ings) {
        if (ings[i].name == name) return ings[i].quantityMl;
      }
  };

    
  // Return how much of an ingredient there was originally
  $scope.getIngQuantityOrig = function(name, ings) {
      for (i in ings) {
        if (ings[i].name == name) return ings[i].quantityOrig;
      }
  };

}
