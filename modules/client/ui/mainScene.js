exports.showHelloPannel = function(viewProfileCallback, logoutCallback, cb) {
  document.getElementById('hello').classList.remove('disable');
  document.getElementById('hello-text').innerHTML = "hello " + user.username;
  document.getElementById('login-form').classList.add('disable');
  document.getElementById('logout').onclick = logoutCallback;
  document.getElementById('view-profile').onclick = viewProfileCallback;

  // var socket = new WebSocket('ws://localhost:3000');
  document.getElementsByTagName('form')[0].onsubmit = function() {
    var inputTag = document.getElementById('msg');
    // socket.send(inputTag.value);
    cb(inputTag.value);
    inputTag.value = '';
    return false;
  }
  // socket.onmessage = function(msg) {
  //   var ulTag = document.getElementById('messages');
  //   var liTag = document.createElement('li');
  //   liTag.innerText = msg.data;
  //   ulTag.appendChild(liTag);
  // }
}

exports.showLoginPannel = function(playAsGuestCallback, cb) {
  document.getElementById('login-google').onclick = function() {
    window.location.href = "/auth/google";
    cb();
  };
  document.getElementById('login-facebook');
  document.getElementById('login-discord');
  document.getElementById('play-as-guest').onclick = function() {
    playAsGuestCallback();
    cb();
  }
}

exports.onChatMessage = function(msg) {
  var ulTag = document.getElementById('messages');
  var liTag = document.createElement('li');
  liTag.innerText = msg.data;
  ulTag.appendChild(liTag);
}
