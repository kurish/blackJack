var mongoose = require('mongoose');
var dbModels = require('./dbModels.js');
var q = require('q');
var crypter = require('crypto-js');
mongoose.Promise = global.Promise;

var promise = mongoose.connect('mongodb://localhost/blackjackDB', {
  useMongoClient: true,
});

var db = mongoose.connection;

var game = mongoose.model("games" , dbModels.gameSchema);
var user = mongoose.model("users" , dbModels.userSchema);

var test = {
  username: "kurish",
  password: "1q2w3e4r",
  moneyAmount: 500,
};

var createUser = function (userData) {
  try {
    var userCreate = {};
    userCreate.username = userData.username;
    userCreate.password = userData.password;
    userCreate.email = userData.email;
    var newUser = new user(userCreate);
    return newUser.save(function (err) {
      if (err) {
        console.log(err);
        return q.reject();
      }
    }).then(function () {
      return q.resolve();
    }).catch(function (e) {
      console.log(e);
      return q.reject();
    });
    return q.reject();
  } catch (e) {
    console.log(e);
    return q.reject();
  }
}
var getAllUsers = function (sortBy) {
  try {
    var returnObj = {};
    var defer = q.defer();
    var findBy ={};
    user.find(findBy, 'username password moneyAmount moneyGained winrate gamesPlayed', {sort: sortBy}, function (err, users) {
        if (err)
        {
          console.log(err);
          returnObj.err = true;
          defer.resolve(returnObj);
        }
        else {
          if (users)
          {
            returnObj.err = false;
            returnObj.users = users;
            //console.log(users);
            defer.resolve(returnObj);
          }
          else {
            returnObj.err = false;
            returnObj.users = null;
            defer.resolve(returnObj);
          }
        }
      });
  } catch (e) {
    console.log(e);
    returnObj.err == true;
    defer.resolve(returnObj);
  }
  return defer.promise;
}
var deleteUsers = function () {
  try {
    user.remove({}, function (err) {
      if (err)
      {
        console.log('Error in delete: ' + err);
      }
      else {
        console.log('documents from users removed');
      }
    });
  } catch (e) {
    console.log(e);
  }
}
var deleteGames = function () {
  try {
    game.remove({}, function (err) {
      if (err)
      {
        console.log('Error in delete: ' + err);
      }
      else {
        console.log('documents from games removed');
      }
    });
  } catch (e) {
    console.log(e);
  }
}


var findByEmail = function (email) {
  try {
    var returnObj = {};
    var defer = q.defer();
    if (email)
    {
      var findBy ={};
      findBy.email = email;
      user.findOne(findBy, 'username password moneyAmount email', function (err, user) {
        if (err)
        {
          console.log(err);
          returnObj.err = true;
          defer.resolve(returnObj);
        }
        else {
          if (user)
          {
            returnObj.err = false;
            returnObj.user = user;
            returnObj.findBy = email;
            defer.resolve(returnObj);
          }
          else {
            returnObj.err = false;
            returnObj.user = null;
            defer.resolve(returnObj);
          }
        }
      });
    }
  } catch (e) {
    console.log(e);
    returnObj.err == true;
    defer.resolve(returnObj);
  }
  return defer.promise;
}
var getGame = function (id) {
  try {
    var findBy = {};
    if (id)
    {
      findBy._id = id;
    }
    return game.find(findBy, 'title cardsInPull gameState userCards date croupierCards winner username bet moneyAmount Blackjack').exec(function (err, game) {
        if (err)
        {
          console.log(err);
          return q.reject();
        }
        else {
          return q.resolve(game);
        }
      });
  } catch (e) {
    console.log('getGame Catched');
    console.log(e);
    return q.reject();
  }
}
var getUser = function (username) {
  try {
    var findBy = {};
    if (username)
    {
      findBy.username = username;
    }
    console.log('start getUser');
    return user.find(findBy, 'username password moneyAmount moneyGained winrate gamesPlayed win').exec(function (err, user) {
        if (err)
        {
          console.log(err);
          return q.reject();
        }
        else {
          return q.resolve(user);
        }
      });
  } catch (e) {
    console.log('getGame Catched');
    console.log(e);
    return q.reject();
  }
}
var updateUser = function (username, moneyAmount, bet, winner) {
    return getUser(username).then(function (userDB) {
      var newUser = userDB[0];
      if (!newUser.gamesPlayed)
      {
        newUser.gamesPlayed = 1;
        newUser.moneyGained = 0;
        newUser.winrate = 0;
        newUser.win = 0;
      }
      else {
        newUser.gamesPlayed++;
      }
      if (winner == 'user')
      {
        newUser.win++;
        newUser.moneyAmount += moneyAmount;
        newUser.moneyGained += moneyAmount;
      }
      if (winner == 'draw')
      {
        newUser.moneyAmount += bet;
      }
      newUser.winrate = Math.floor(newUser.win/newUser.gamesPlayed * 100);
    var update = newUser;
    user.update({ username: newUser.username }, update).then(function (err) {
      getUser(newUser.username).then(function (user) {
        console.log('newUser:');
        console.log(user[0]);
      });
    }).catch(function (err) {
       console.log('catch error:');
       console.log(err);
    });
});
}
var placeBet = function (req) {
  try {
    var returnObj = {};
    var money = Math.abs(req.moneyAmount);
    return getUser(req.username).then(function (user) {
      if (user.moneyAmount < money)
      {
        returnObj.err = false;
        returnObj.success = false;
        returnObj.msg = 'Not enough money';
        return q.resolve(returnObj);
      }
      else {
        console.log('before game.update({_id : req._id}, { $inc: { moneyAmount: money}})');
        return game.update({_id : req._id}, { $inc: { moneyAmount: money}}).then(function (err) {
          if (err)
          {
            console.log("game.update({_id : req._id}, { $inc: { moneyAmount: money}}) Crashed");
            returnObj.err = true;
            return q.resolve(returnObj);
          }
          console.log('game updated placeBet');
          return getGame(req._id).then(function (game) {
            return user.update({_id : req._id}, { $inc: { moneyAmount: -money }}).then(function (err) {
              if (err)
              {
                console.log("game.update({_id : req._id}, { $inc: { moneyAmount: money}}) Crashed");
                returnObj.err = true;
                return q.resolve(returnObj);
              }
              console.log('users money updated');
              returnObj.err = false;
              returnObj.success = true;
              return q.resolve(returnObj);
            }).catch(function (err) {
               console.log(err);
            });
          });
        });
      }
    });
  } catch (e) {
    console.log('dbWrapper getCard ERROR:');
    console.log(e);
  }
}
exports.findByUsername = function (enter) {
  try {
    var username;
    if (enter.username)
    {
      username = enter.username;
    }
    else {
      username = enter;
    }
    var returnObj = {};
    var defer = q.defer();
    if (username)
    {
      var findBy ={};
      findBy.username = username;
      user.findOne(findBy, 'username password moneyAmount email', function (err, user) {
        if (err)
        {
          console.log(err);
          returnObj.err = true;
          defer.resolve(returnObj);
        }
        else {
          if (user)
          {
            returnObj.err = false;
            returnObj.user = user;
            returnObj.findBy = username;
            defer.resolve(returnObj);
          }
          else {
            returnObj.err = false;
            returnObj.user = null;
            defer.resolve(returnObj);
          }
        }
      });
    }
  } catch (e) {
    console.log(e);
    returnObj.err == true;
    defer.resolve(returnObj);
  }
  return defer.promise;
}
exports.checkLogin = function (userData) {
  try {
    console.log('Check Login...');
    var returnObj = {};
    returnObj.success = false;
    returnObj.err = false;
    return exports.findByUsername(userData).then(function (userObj) {
      if (userObj.user === null || userObj.err)
      {
        returnObj.msg = 'no such user in our database';
        if (userObj.err)
        {
          returnObj.msg = 'internal server error';
          returnObj.err = true;
        }
        return q.reject(returnObj);
      }
      else {
        var cryptedPassword = crypter.MD5(userData.password).toString();
        if (cryptedPassword == userObj.user.password)
        {
           returnObj.success = true;
           returnObj.err = false;
           returnObj.username = userObj.user.username;
           returnObj.password = userObj.user.password;
           return q.resolve(returnObj);
        }
        else {
          returnObj.msg = 'wrong password';
          return q.reject(returnObj);
        }
      }
      });
    }
  catch (e) {
    console.log(e);
  }
}
exports.checkRegister = function (userData) {
  console.log('Check Register...');
  var returnObj = {};
  returnObj.success = false;
  returnObj.err = false;
  returnObj.msg = '';
  return exports.findByUsername(userData.username).then(function (userObj) {
    console.log('findByUsername start');
    console.log(userObj);
    if (userObj.user != null || userObj.err)
    {
      if (userObj.err)
      {
        returnObj.err = true;
        returnObj.msg = 'internal error';
        return q.resolve(returnObj);
      }
      else {
          returnObj.success = false;
          returnObj.msg = 'user already exist';
          return q.resolve(returnObj);
      }
    }
    else {
       return q.resolve(returnObj);
    }
  }).then(function (returnObj) {
     if (returnObj.msg == 'user already exist')
     {
       return q.resolve(returnObj);
     }
     else {
       return findByEmail(userData.email).then(function (userObjEmail) {
         if (userObjEmail.user === null || userObjEmail.err)
         {
           if (userObjEmail.err)
           {
             returnObj.err = true;
             returnObj.msg = 'internal error';
             return q.resolve(returnObj);
           }
           else {
             userData.password = crypter.MD5(userData.password).toString();
             return createUser(userData).then(function () {
                 returnObj.success = true;
                 returnObj.msg = 'register done';
                 returnObj.username = userData.username;
                 returnObj.password = userData.password;
                 //returnObj.email = userData.email;
                 return q.resolve(returnObj);
               }).catch(function () {
                 returnObj.err = true;
                 returnObj.msg = 'internal error';
                 return q.resolve(returnObj);
               });
           }
         }
         else {
           returnObj.success = false;
           returnObj.msg = 'email already exist';
           return q.resolve(returnObj);
         }
       });
     }
  });
}
exports.getTopUsers = function (options) {
  try {
    var returnObj = {};
    return getAllUsers(options.sortBy).then(function (usersObj) {
      if (usersObj.err)
      {
        returnObj.err = true;
        return q.resolve(returnObj);
      }
      else {
        if (usersObj.users)
        {
          returnObj.err = false;
          returnObj.users = usersObj.users.slice(0, options.usersCount);
          return q.resolve(returnObj);
        }
        else {
          returnObj.err = false;
          return q.resolve(returnObj);
        }
      }
    });
  } catch (e) {
    console.log('exports.getTopUsers');
    console.log(e);
  }
}
exports.getLastGame = function (user) {
  try {
    var returnObj = {};
    var defer = q.defer();
    if (!user)
    {
      returnObj.err = 'no user parameter';
      defer.resolve(returnObj);
      return defer.promise;
    }
    //console.log('getLastGames');
    game.findOne({gameState: global.gameSettings.gameStates.closed, username: user.username}, 'title cardsInPull gameState userCards date croupierCards winner', function (err, game) {
        if (err)
        {
          console.log(err);
          returnObj.err = true;
          defer.resolve(returnObj);
        }
        else {
          if (game)
          {
            returnObj.err = false;
            returnObj.game = game;
            defer.resolve(returnObj);
          }
          else {
            returnObj.err = false;
            returnObj.game = null;
            defer.resolve(returnObj);
          }
        }
      });
  } catch (e) {
    console.log(e);
    returnObj.err == true;
    defer.resolve(returnObj);
  }
  return defer.promise;
}
exports.getCurrentGame = function (userData) {
  try {
    var returnObj = {};
    var defer = q.defer();
    if (!user)
    {
      returnObj.err = 'no user parameter';
      defer.resolve(returnObj);
      return defer.promise;
    }
    game.findOne({gameState: global.gameSettings.gameStates.created, username: userData.username}, 'title gameState userCards date croupierCards bet', function (err, game) {
        if (err)
        {
          console.log(err);
          returnObj.err = true;
          defer.resolve(returnObj);
        }
        else {
          if (game)
          {
            returnObj.err = false;
            returnObj.game = game;
            // send only 1 card of croupier
            if (returnObj.game.croupierCards)
            {
              returnObj.game.croupierCards = returnObj.game.croupierCards.slice(0, (returnObj.game.croupierCards.length - 1));
            }
            defer.resolve(returnObj);
          }
          else {
            returnObj.err = false;
            returnObj.game = null;
            defer.resolve(returnObj);
          }
        }
      });
  } catch (e) {
    console.log(e);
    returnObj.err == true;
    defer.resolve(returnObj);
  }
  return defer.promise;
}
exports.createNewGame = function (userData) {
  try {
    //check if no games
    var returnObj = {};
    returnObj.err = false;
    return exports.getCurrentGame(userData).then(function (currentGames) {
      if (currentGames.game) {
        return q.resolve(currentGames);
      }
      else {
        return getUser(userData.username).then(function (userDB) {
          if (userDB[0].moneyAmount < userData.moneyAmount)
          {
            returnObj.msg = 'No money';
            returnObj.err = true;
            return q.resolve(returnObj);
          }
          var createGameObj = {};
          createGameObj.username = userData.username;
          createGameObj.cardsInPull = global.gameSettings.cards;
          createGameObj.gameState = global.gameSettings.gameStates.created;
          createGameObj.userCards = [];
          createGameObj.croupierCards = [];
          createGameObj.bet = userData.moneyAmount;
          createGameObj = global.gameWrapper.startGame(createGameObj);
          var newGame = new game(createGameObj);
          return newGame.save(function (err, game) {
            if (err)
            {
              console.log(err);
              returnObj.err = true;
            }
          }).then(function (game) {
            returnObj.game = game;
            if (returnObj.game.croupierCards)
            {
              returnObj.game.croupierCards = returnObj.game.croupierCards.slice(0, (returnObj.game.croupierCards.length - 1))[0];
            }
            var conditions = { username: userData.username },
            update = { $inc: { moneyAmount: -returnObj.game.bet }},
            options = { multi: false };
            console.log(conditions);
            console.log(update);
            user.update(conditions, update, options).then(function () {
              getUser(userData.username).then(function (user) {
                console.log(user[0]);
              })
            });
            return q.resolve(returnObj);
          }).catch(function (e) {
            console.log(e);
            returnObj.err = true;
            return q.resolve(returnObj);
          });
        });

      }
    });
  } catch (e) {
    console.log(e);
  }
}
exports.getCard = function (req) {
  try {
    var returnObj = {};
    return getGame(req._id).then(function (gameNow) {
      if (gameNow[0].gameState != global.gameSettings.gameStates.created)
      {
        returnObj.err = true;
        return q.resolve(returnObj);
      }
      var gameUpdate = global.gameWrapper.getCard(gameNow[0]);
      return game.update(req, gameUpdate).then(function (err, game) {
        return getGame(req._id).then(function (game) {
          returnObj.game = game[0];
          if (returnObj.game.croupierCards)
          {
            returnObj.game.croupierCards = returnObj.game.croupierCards.slice(0, (returnObj.game.croupierCards.length - 1))[0];
          }
          return q.resolve(returnObj);
        });
      });
    });
  } catch (e) {
    console.log('dbWrapper getCard ERROR:');
    console.log(e);
  }
}
exports.closeGame = function (data) {
  try {
    var returnObj = {};
    return getGame(data._id).then(function (gameDB) {
      if (gameDB[0].gameState != global.gameSettings.gameStates.created)
      {
        return returnObj.game = null;
      }
      var closedGame = global.gameWrapper.closeGame(gameDB[0]);
      return game.update(data, closedGame).then(function (err) {
        return getGame(data).then(function (game) {
          returnObj.game = game[0];
          updateUser(returnObj.game.username, returnObj.game.moneyAmount, returnObj.game.bet, returnObj.game.winner);
          return q.resolve(returnObj);
        });
      });
    }).catch(function (err) {
      console.log('catched closeGame');
      console.log(err);
      return returnObj.game = null;
    });
  } catch (e) {
    console.log(e);
  }
}


//deleteGames();
//deleteUsers();

/*
getGame().then(function (game) {
  console.log(game);
});
deleteGames();
/*
title:  {type: String, default: 'default game'},
username: String,
moneyAmount: Number,
cardsInPull: [{ name: String, img: String, value: Number}],
gameState: Number,
userCards: [{ name: String, img: String, value: Number}],
croupierCards: [{ name: String, img: String, value: Number}],
date: { type: Date, default: Date.now },
winner: String,
bet: Number


getAllUsers().then(function (usersObj) {
  console.log(usersObj.users);
});
*/
