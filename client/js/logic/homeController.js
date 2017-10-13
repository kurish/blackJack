app.controller('homeController', function ($scope, apiLayer, socket, $q) {

  $scope.init = function () {
    $scope.register = false;
    //$scope.lastGame = {};
    checkIfLogged();
  }

$scope.switchAuth = function () {
  $scope.register = !$scope.register;
}

$scope.submitLogin = function (username, password) {
  var userData = {};
  if (username && password)
  {
    userData.username = username;
    userData.password = password;
  }
  else {
    userData.username = $scope.usernameFromForm;
    userData.password = $scope.passwordFromForm;
  }
  apiLayer.apiPostCall('api/login', userData).then(function (data) {
    if (data.eror)
    {
      $scope.LoginFormMessage = "Sorry, we got problems! Try again later.";
    }
    else {
      if (data.success)
      {
        // TODO cookies
        $scope.LoginFormMessage = "Welcome!";
        document.cookie = "username=" + data.username + ";";
        document.cookie = "password=" + data.password + ";";
        $scope.loginned = true;
        $scope.register = false;
        $scope.username = data.username;
      }
      else {
        console.log(data);
        $scope.LoginFormMessage = "Sorry, check your data! Because of " + data.msg + ".";
      }
    }
  }).catch(function () {
      console.log('catched');
      $scope.formMessage = "Sorry, we got problems! Try again later.";
  });
}

$scope.submitRegister = function () {
  var userData = {};
  userData.username = $scope.usernameFromForm;
  userData.password = $scope.passwordFromForm;
  userData.email = $scope.emailFromForm;
  apiLayer.apiPostCall('api/register', userData).then(function (data) {
    if (data.eror)
    {
      $scope.LoginFormMessage = "Sorry, we got problems! Try again later.";
    }
    else {
      if (data.success)
      {
        // TODO cookies
        console.log(data);
        $scope.RegisterFormMessage = "Registered!";
        $scope.loginned = true;
        $scope.username = data.username;
        document.cookie = "username=" + data.username + ";";
        document.cookie = "password=" + data.password + ";";
      }
      else {
        $scope.RegisterFormMessage = "Sorry, change your data! This " + data.msg + ".";
      }
    }
  }).catch(function () {
      console.log('catched');
      $scope.formMessage = "Sorry, we got problems! Try again later.";
  });
}

$scope.Logout = function () {
  document.cookie = "username=; path=/;";
  document.cookie = "password=; path=/;";
  window.location.reload();
}

var getCookie = function (name) {
  var matches = document.cookie.match(new RegExp(
    "(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"
  ));
  return matches ? decodeURIComponent(matches[1]) : undefined;
}

var checkIfLogged = function () {
  try {
    var username = getCookie('username');
    var password = getCookie('username');
    if (username && password)
    {
      $scope.submitLogin(username, password);
    }
    var options = {};
    options.username = username;
    /*apiLayer.apiPostCall('api/getLastGame', options).then(function (data) {
      console.log('getLastGame:');
      console.log(data);
      if (data.game)
      {
        $scope.lastGame.found = true;
        $scope.lastGame = data.game;
        $scope.lastGame.date = $scope.lastGame.date.substr(0, $scope.lastGame.date.indexOf('T'));
      }
      else {
        $scope.lastGame.found = false;
      }
    });*/
  } catch (e) {
    console.log(e);
  }
}

});
