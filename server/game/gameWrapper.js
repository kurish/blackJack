var q = require('q');
var dbWrapper = require("../db/dbWrapper.js");

exports.startGame = function (game) {
  try {
    var tempGame = game;
    tempGame.cardsInPull = cardsShuffle(tempGame.cardsInPull);
    tempGame.userCards.push(tempGame.cardsInPull.splice(0,1)[0]);
    tempGame.croupierCards.push(tempGame.cardsInPull.splice(0,1)[0]);
    tempGame.userCards.push(tempGame.cardsInPull.splice(0,1)[0]);
    tempGame.croupierCards.push(tempGame.cardsInPull.splice(0,1)[0]);
    console.log('startGame tempGame:');
    console.log(tempGame);
    return tempGame;
  } catch (e) {
    console.log(e);
  }
}
exports.getCard = function (game) {
  try {
    var tempGame = game;
    if (!tempGame.cardsInPull)
    {
      return;
    }
    tempGame.userCards.push(tempGame.cardsInPull.splice(0,1)[0]);
    return tempGame;
  } catch (e) {
    console.log('gameWrapper exports.getCard ERROR:');
    console.log(e);
  }
}
exports.closeGame = function (game) {
  try {
    var tempGame = game;
    tempGame.gameState = global.gameSettings.gameStates.closed;
    var croupierScore = getScore(tempGame.croupierCards);
    var userScore = getScore(tempGame.userCards);
    while (croupierScore < 17)
    {
      tempGame.croupierCards.push(tempGame.cardsInPull.splice(0,1)[0]);
      croupierScore = getScore(tempGame.croupierCards, false);
    }
    if (userScore == 21)
    {
        tempGame.moneyAmount = tempGame.bet * 2.5;
    }
    else
    {
        tempGame.moneyAmount = tempGame.bet * 2;
    }
    var winScore = getBetterScore(croupierScore, userScore);
    if (winScore == userScore)
    {
      tempGame.winner = 'user';
    }
    else {
      tempGame.winner = 'casino';
    }
    if ((winScore == userScore) && (winScore == croupierScore))
    {
      tempGame.winner = 'draw';
    }
    tempGame.userScore = userScore;
    tempGame.croupierScore = croupierScore;
    return tempGame;
  } catch (e) {
    console.log(e);
  }
}

var cardsShuffle = function (array) {
  try {
    var currentIndex = array.length, temporaryValue, randomIndex;
    while (0 !== currentIndex) {
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex -= 1;
      temporaryValue = array[currentIndex];
      array[currentIndex] = array[randomIndex];
      array[randomIndex] = temporaryValue;
    }
    return array;
  } catch (e) {
    console.log(e);
  }
}
var getScore = function (cardsArray) {
  var score = 0;
    var a = false;
    var aCount = 0;
    console.log('getScore, cardsArray:');
    console.log(cardsArray);
    cardsArray.forEach(function (card) {
      if (card.name.indexOf('_a') != -1)
      {
        aCount++;
        a = true;
      }
      score += card.value;
    });
    if (a)
    {
      return getBetterScore(score, score-(10*aCount));
    }
    else {
      return score;
    }
}
var getBetterScore = function (scorePrbbly, score) {
  if ((scorePrbbly > 21) && (score > 21))
  {
    return Math.min(scorePrbbly, score);
  }
  if ((scorePrbbly <= 21) && (score > 21))
  {
    return scorePrbbly;
  }
  if ((scorePrbbly > 21) && (score <= 21))
  {
    return score;
  }
  if ((scorePrbbly <= 21) && (score <= 21))
  {
    return Math.max(scorePrbbly, score);
  }
}

/*
exports.gameSchema = new Schema({
  title:  {type: String, default: 'default game'},
  username: String,
  moneyAmount: Number,
  cardsInPull: [{ img: String, value: Number}],
  gameState: Number,
  userCards: [{ img: String, value: Number}],
  croupierCards: [{ img: String, value: Number}],
  date: { type: Date, default: Date.now },
  winner: String,
  bet: Number
});
*/
