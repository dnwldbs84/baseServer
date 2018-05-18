var clientModule = require('../../modules/client');
var publicModule = require('../../modules/public');

var socket = new clientModule.WebSocket();

clientModule.UI.uiEventHandler.initMainSceneEventHandler(
    clientModule.UI.mainScene, clientModule.Ajax, setupSocket, sendStringMessage, sendIntegerMessage, sendSelfMessage);

if(user){
  setupSocket();
  clientModule.UI.mainScene.showHelloPannel();
}else{
  clientModule.UI.mainScene.showLoginPannel();
}

window.onbeforeunload = function(e) {
  socket.close(1000);
}

function setupSocket() {
  socket.open('ws://localhost:3000');
  socket.onmessage = function(packet) {
    var msg = publicModule.encoder.decodePacket(packet.data);
    clientModule.UI.mainScene.displayChatMessage(msg);
  }
}

function sendStringMessage(msg) {
  var packet = publicModule.encoder.encodePacketWithType(publicModule.config.MESSAGE_DATA_TYPE.STRING, publicModule.config.MESSAGE_TYPE.CHAT_TO_ALL, msg);
  socket.send(packet);
}

function sendIntegerMessage(msg) {
  var packet = publicModule.encoder.encodePacketWithType(publicModule.config.MESSAGE_DATA_TYPE.INTEGER, publicModule.config.MESSAGE_TYPE.CHAT_TO_ALL, msg);
  socket.send(packet);
}

function sendSelfMessage(msg) {
  var packet = publicModule.encoder.encodePacketWithType(publicModule.config.MESSAGE_DATA_TYPE.STRING, publicModule.config.MESSAGE_TYPE.CHAT_TO_SELF, msg);
  socket.send(packet);
}
