app.controller('masterController', function ($scope, apiLayer, socket, $q) {

$scope.navigate = function(route, subRoute, hashRoute) {
    //encode
    route = route.customHtmlEncode();
    $scope.route = route;
    var domain = getDomain();
    var fullPath = domain + '/' + route;
    //alert('$scope.navigate().  fullPath: ' + fullPath);
    if (subRoute) {
      subRoute = subRoute.customHtmlEncode();
      fullPath += '/' + subRoute;
    }
    var currentUrl = window.location.href;
    if (hashRoute) {
      hashRoute = hashRoute.customHtmlEncode();
      if (currentUrl.startsWith(fullPath + '#')) {
        $scope.hashRoute = hashRoute;
        $scope.navigationCount++;
        window.location.hash = hashRoute;
        return;
      }
      fullPath += '#' + hashRoute;
    }
  };

  $scope.loadView = function () {
    switch ($scope.route) {
      case "game":
        return "/views/game.html";
      case "stat":
        return '/views/stat.html';
      default:
        return '/views/home.html';
    }
  };

});
