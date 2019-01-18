function HistoryController($scope, $http) {
  $scope.histories = [];

  $scope.setHistories = function (histories) {
    $scope.histories = histories;
    
    // Set today's date
    $scope.todayDate = new Date();
    
    // Set tomorrow's date
    $scope.tomorrow = new Date();
    $scope.tomorrow.setDate($scope.tomorrow.getDate() + 1);
  };
  


}
