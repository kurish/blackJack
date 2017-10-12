app.controller('statController', function ($scope, apiLayer, socket, $q) {

  $scope.init = function () {
    var options = {
      count: null,
      sortBy: '-moneyGained'
    };
    apiLayer.apiPostCall('api/getTopUsers', options).then(function (data) {
      console.log(data);
      $scope.topMoneyGained = data.users;
    });
    options.sortBy = '-gamesPlayed';
    apiLayer.apiPostCall('api/getTopUsers', options).then(function (data) {
      console.log(data);
      $scope.topGamesPlayed = data.users;
    });
    options.sortBy = '-winrate';
    apiLayer.apiPostCall('api/getTopUsers', options).then(function (data) {
      console.log(data);
      $scope.topWinrate = data.users;
    });
  }


});
