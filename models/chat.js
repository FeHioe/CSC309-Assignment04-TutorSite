var mongoose = require('mongoose');

//Schema for the chat
var chatSchema = new mongoose.Schema({

  //each pair of users is linked by a unique roomName, where all the messages are stored, with the sender.
  //While our design supports only two users per room, it is possible to use this DB schema for more
  //than two users per room.
  roomName: {type: Number, unique: true},
  messages: [{msg:String, sender:String}]

});

var Chat = mongoose.model('Chat', chatSchema);

module.exports = Chat;
