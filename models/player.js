var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var playerSchema = new Schema({
    name: String,
    score: { type: Number, default: 0 }
});

var Player = mongoose.model('Player', playerSchema);

module.exports = Player;