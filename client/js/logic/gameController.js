app.controller('gameController', function ($scope, apiLayer, socket, $q) {

  $scope.init = function () {
     $scope.chips = [
       {
         value: 5,
         img: "../images/chips/chip_blue_5.png"
       },
       {
         value: 10,
         img: "../images/chips/chip_black_10.png"
       },
       {
         value: 15,
         img: "../images/chips/chip_red_15.png"
       },
       {
         value: 25,
         img: "../images/chips/chip_green_25.png"
       },
    ];
    $scope.gameButtons = [
      {
        value: 'Cancel bet'
      },
      {
        value: 'Place a bet'
      },
      {
        value: 'Take a card'
      },
      {
        value: 'Uncover'
      }
    ];
     $scope.gameLive = false;
     $scope.showPopup = false;
     $scope.popUpEndGame = false;
     $scope.popUp = {};
     $scope.currentGame = {};
     $scope.username = getCookie('username');
     $scope.password = getCookie('password');

     $scope.userCards = [];
     $scope.croupierCards = [];
     $scope.currentScore = 0;
     $scope.possibleScore = {};
     $scope.betSize = 0;

     if (!$scope.username || !$scope.password)
     {
       $scope.loginned = false;
     }
     else {
       updateUserData();
     }

  }
  $scope.addBet = function (bet) {
    $scope.betSize += bet;
  }
  $scope.createGame = function () {
    if ($scope.betSize > 0)
    {
      var data = {
        username : $scope.username,
        moneyAmount: $scope.betSize
      };
      apiLayer.apiPostCall('api/createNewGame', data).then(function (gameData) {
         $scope.currentGame.game = gameData.game;
         $scope.startNewGameEnabled = false;
         $scope.currentGame.live = true;
         $scope.updateTable(gameData);
      }).catch(function (e) {
         console.log(e);
      });
    }
    else {
      $scope.createPopUp('No bet');
    }
  }
  $scope.toLogin = function () {
    window.location.reload();
  }
  $scope.clickButton = function (button) {
    switch (button.value) {
      case 'Take a card':
        $scope.getCard();
        break;
      case 'Cancel bet':
        $scope.betSize = 0;
        break;
      case 'Place a bet':
        if ($scope.betSize > $scope.moneyAmount)
        {
          $scope.createPopUp('No money');
        }
        $scope.createGame();
        break;
      case 'Uncover':
        $scope.uncover();
        break;
    }
  }
  $scope.updateTable = function (gameData, end) {

    if (!gameData.game)
    {
      if (gameData.msg == 'No money')
      {
        $scope.createPopUp('No money');
        return;
      }
      $scope.createPopUp('internalError');
      return;
    }
    $scope.gameLive = true;
    if (!end)
    {
      var backCard = {
        name: 'back'
      };
      $scope.userCards = gameData.game.userCards;
      $scope.croupierCards = gameData.game.croupierCards;
      $scope.croupierCards.push(backCard);

      $scope.betSize = gameData.game.bet;

      $scope.currentScore = 0;
      $scope.possibleScore.value = 0;
      $scope.possibleScore.active = false;

      $scope.userCards.forEach(function (card) {
        $scope.currentScore += card.value;
        $scope.possibleScore.value += card.value;
        if (card.name.indexOf('_a') != -1)
        {
          $scope.possibleScore.value -= 10;
          $scope.possibleScore.active = true;
        }
      });
      if (($scope.currentScore == 21) || ($scope.possibleScore.value == 21))  // ==
      {
        $scope.createPopUp('Blackjack');
      }
    }
    else {
      console.log('create end game popup');
      $scope.userCards = gameData.game.userCards;
      $scope.croupierCards = gameData.game.croupierCards;
      $scope.createPopUp('end game', gameData.game.winner);
    }
  }

  $scope.getCard = function () {
    if (!$scope.currentGame.live)
    {
      $scope.createPopUp('Create game');
      return;
    }
    if (($scope.currentScore) >= 21 && ($scope.possibleScore.value >= 21))
    {
      $scope.createPopUp('over');
    }
    else {
      console.log('else getCard');
      console.log($scope.currentGame);
      console.log('apiPostCall :' + $scope.currentGame.game._id);
      var id = { _id: $scope.currentGame.game._id};
      apiLayer.apiPostCall('api/getCard', id).then(function (gameData) {
        console.log('api/getCard then');
        console.log(gameData);
        if (gameData.game == null)
        {
          $scope.createPopUp('internalError');
          $scope.startNewGameEnabled = true;
        }
        else {
          console.log('getCard gameData');
          console.log(gameData);
          $scope.currentGame.game = gameData.game;
          $scope.updateTable(gameData, false);
        }
      }).catch(function (e) {
         console.log(e);
      });
    }
  }
  $scope.placeBet = function () {
    var data = {
      username: $scope.username,
      _id : $scope.currentGame.game._id,
      moneyAmount: $scope.betSize
    };
    apiLayer.apiPostCall('api/placeBet', data).then(function (returnObj) {
      console.log('api/placeBet client:');
      console.log(returnObj);
      if (returnObj.err == true)
      {
        $scope.createPopUp('internalError');
        $scope.currentGame = {};
      }
      else {
        if (!returnObj.success)
        {
          $scope.createPopUp('No money');
        }
        else {
          $scope.currentGame = {};
          updateUserData();
        }
      }
    }).catch(function (e) {
       console.log(e);
    });
  }
  $scope.uncover = function () {
    try {
      if (!$scope.currentGame.live || !$scope.currentGame.game)
      {
        $scope.createPopUp('Create game');
      }
      else {
        var data = {};
        data._id = $scope.currentGame.game._id;
        apiLayer.apiPostCall('api/closeGame', data).then(function (gameData) {
          console.log('api/closeGame then controller');
          console.log(gameData);
          updateUserData();
          $scope.currentGame.live = false;
          $scope.updateTable(gameData, true);
          if (gameData.game == null)
          {
            $scope.createPopUp('internalError');
            console.log('gameData.game == null');
            $scope.startNewGameEnabled = true;
          }
          else {

          }
        }).catch(function (e) {
           console.log(e);
        });
      }
    } catch (e) {
      console.log(e);
    }
  }
  $scope.createPopUp = function (reason, winner) {
    console.log('createPopUp');
    switch (reason) {
      case 'over':
        $scope.popUp.topmsg = "Sorry :(";
        $scope.popUp.msg = "You have already to many points";
        $scope.showPopup = true;
        break;
      case 'internalError':
        $scope.popUp.topmsg = "Sorry :(";
        $scope.popUp.msg = "Internal server error";
        $scope.showPopup = true;
        break;
        case 'Blackjack':
          $scope.popUp.topmsg = "Blackjack!";
          $scope.popUp.msg = "Just end this game to win?";
          $scope.showPopup = true;
          break;
          case 'No bet':
          $scope.popUp.topmsg = "No bet!";
          $scope.popUp.msg = "Please place bet for start";
          $scope.showPopup = true;
          break;
          case 'No money':
          $scope.popUp.topmsg = "No money!";
          $scope.popUp.msg = "Please top up your account";
          $scope.showPopup = true;
          break;
          case 'Create game':
          $scope.popUp.topmsg = "No game now ;(";
          $scope.popUp.msg = "Please, place a bet and start a game";
          $scope.showPopup = true;
          break;
          case 'end game':
          $scope.popUpEndGame = true;
          if (winner == 'user')
          {
            $scope.popUp.topmsg = "Congratulations!";
            $scope.popUp.msg = "You have win this game!";
            $scope.showPopup = true;
          }
          if (winner == 'casino')
          {
            $scope.popUp.topmsg = "Lose";
            $scope.popUp.msg = "Good luck next time!";
            $scope.showPopup = true;
          }
          if (winner == 'draw')
          {
            $scope.popUp.topmsg = "Draw";
            $scope.popUp.msg = "Time to try next one!";
            $scope.showPopup = true;
          }
          break;
    }
  }
  $scope.closePopUp = function () {
    console.log('closePopUp called');
    if ($scope.popUpEndGame == true)
    {
      console.log('$scope.popUpEndGame == true');
      $scope.showPopup = false;
      $scope.popUp = {};
      $scope.init();
    }
    else {
      console.log('closePopUp');
      $scope.showPopup = false;
      $scope.popUp = {};
      // tut
    }
    console.log('after if');
  }


var getCookie = function (name) {
    var matches = document.cookie.match(new RegExp(
      "(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"
    ));
    return matches ? decodeURIComponent(matches[1]) : undefined;
}
var getActiveGame = function () {
  try {
    var data = {
      username : $scope.username
    };
    apiLayer.apiPostCall('api/getCurrentGame', data).then(function (gameData) {
      console.log('getActiveGame then controller');
      console.log(gameData);
      if (gameData.game == null)
      {
        console.log('gameData.game == null');
        $scope.startNewGameEnabled = true;
      }
      else {
        $scope.betSize = gameData.game.moneyAmount;
        $scope.currentGame.game = gameData.game;
        $scope.currentGame.live = true;
        $scope.updateTable(gameData, false);
        $scope.startNewGameEnabled = false;
      }
    }).catch(function (e) {
       console.log(e);
    });
  } catch (e) {
    console.log(e);
  }
}
var updateUserData = function () {
  var data = {
    username : $scope.username
  };
  apiLayer.apiPostCall('api/getUserData', data).then(function (userdata) {
    if (userdata.user == null)
    {
      console.log('userdata.user == null');
      $scope.loginned = false;
    }
    else {
      $scope.loginned = true;
      $scope.moneyAmount = userdata.user.moneyAmount;
      getActiveGame();
    }
  }).catch(function (e) {
     console.log(e);
  });
}
});
