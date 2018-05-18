exports.initMainSceneEventHandler = function(mainScene, Ajax, setupSocket, sendStringMessage, sendIntegerMessage, sendSelfMessage) {
  mainScene.onViewProfile = function() {
    Ajax.tryAjax('/profile', null,
      function(req) {
        var res = JSON.parse(req.response);
        if(res.user) {
          console.log(res.user);
        }
      });
  }
  mainScene.onLogout = function() {
    Ajax.tryAjax('/logout', null,
      function() {
        window.location.href = '/';
      });
  }
  mainScene.onPlayAsGuest = function(cb) {
    Ajax.tryAjax('/play-as-guest', 'username=Guest&password=none',
      function(req) {
        var res = JSON.parse(req.response);
        if (res.user) {
          user = res.user;
          cb();
          setupSocket();
        }
      });
  }
  mainScene.onLeaveGame = function() {
    Ajax.tryAjax('/leave-game', null,
      function(req) {
        window.location.href = '/';
      });
  }
  mainScene.onSubmitStringMessage = sendStringMessage;
  mainScene.onSubmitIntegerMessage = sendIntegerMessage;
  mainScene.onSubmitSelfMessage = sendSelfMessage;
}
