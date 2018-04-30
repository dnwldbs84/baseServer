var clientModule = require('../../modules/client');
// var publicUtil = require('../../modules/public.js');

var socket = new clientModule.WebSocket();

if(user){
  setupSocket();
  clientModule.UI.mainScene.showHelloPannel(viewProfileCallback, logoutCallback, sendPacket);
    // function(chatMsg) {
    //   socket.send(chatMsg);
    // });
}else{
  clientModule.UI.mainScene.showLoginPannel(playAsGuestCallback, setupSocket);
    // function() {
    //   setupSocket();
    // });
  // clientModule.WebSocket.close(1000);
}


function setupSocket() {
  socket.open('ws://localhost:3000');
  socket.onmessage = function(msg) {
    clientModule.UI.mainScene.onChatMessage(msg);
    // console.log(msg);
  }
}
function sendPacket(packet) {
  socket.send(packet);
}
function viewProfileCallback() {
  clientModule.Ajax.tryAjax('/profile', null,
    function(req) {
      var res = JSON.parse(req.response);
      if(res.user) {
        console.log(res.user);
      }
    });
}
function logoutCallback() {
  clientModule.Ajax.tryAjax('/logout', null,
    function() {
      console.log('reload');
      window.location.href = '/';
    });
}
function playAsGuestCallback() {
  clientModule.Ajax.tryAjax('/play-as-guest', 'username=Guest&password=none',
    function(req) {
      var res = JSON.parse(req.response);
      if(res.user) {
        user = res.user;
        clientModule.UI.mainScene.showHelloPannel(viewProfileCallback, logoutCallback, sendPacket);
          // function(chatMsg) {
          //   socket.send(chatMsg);
          // });
      }
    });
}
