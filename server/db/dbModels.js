var mongoose = require('mongoose');

var Schema = mongoose.Schema;

exports.gameSchema = new Schema({
  title:  {type: String, default: 'default game'},
  username: String,
  moneyAmount: Number,
  cardsInPull: [{ name: String, value: Number}],
  gameState: Number,
  userCards: [{ name: String, value: Number}],
  croupierCards: [{ name: String, value: Number}],
  date: { type: Date, default: Date.now },
  winner: String,
  bet: Number
});

exports.userSchema = new Schema({
  username:  String,
  password: String,
  moneyAmount: {type: Number, default:300},
  email: String,
  moneyGained: Number,
  winrate: Number,
  gamesPlayed: Number,
  win: {type: Number, default:0}
});
