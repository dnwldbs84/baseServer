exports.onViewProfile = new Function();
exports.onLogout = new Function();
exports.onPlayAsGuest = new Function();
exports.onLeaveGame = new Function();

exports.onSubmitStringMessage = new Function();
exports.onSubmitIntegerMessage = new Function();
exports.onSubmitSelfMessage = new Function();

exports.showHelloPannel = function() {
  document.getElementById('hello').classList.remove('disable');

  document.getElementById('hello-text').innerHTML = "hello " + user.displayName;
  document.getElementById('login-form').classList.add('disable');

  document.getElementById('leave-game').onclick = leaveGame;
  document.getElementById('logout').onclick = logout;
  document.getElementById('view-profile').onclick = viewProfile;
  // document.getElementsByTagName('form')[0].onsubmit = submitMessage;
  document.getElementById('send-string').onclick = submitStringMessage;
  document.getElementById('send-integer').onclick = submitIntegerMessage;
  document.getElementById('send-to-self').onclick = submitSelfMessage;
}
exports.showLoginPannel = function() {
  document.getElementById('login-google').onclick = loginGoogle;
  document.getElementById('login-facebook');
  document.getElementById('login-discord');
  document.getElementById('play-as-guest').onclick = playAsGuest;
}
exports.displayChatMessage = function(msg) {
  var ulTag = document.getElementById('messages');
  var liTag = document.createElement('li');
  liTag.innerText = msg;
  ulTag.appendChild(liTag);
}

function viewProfile() {
  exports.onViewProfile();
}
function leaveGame() {
  exports.onLeaveGame();
}
function logout() {
  exports.onLogout();
}
function playAsGuest() {
  exports.onPlayAsGuest(exports.showHelloPannel);
}
function submitStringMessage() {
  var inputTag = document.getElementById('msg');
  exports.onSubmitStringMessage(inputTag.value);
  inputTag.value = '';
  return false;
}
function submitIntegerMessage() {
  var inputTag = document.getElementById('msg');
  exports.onSubmitIntegerMessage(inputTag.value);
  inputTag.value = '';
  return false;
}
function submitSelfMessage() {
  var inputTag = document.getElementById('msg');
  exports.onSubmitSelfMessage(inputTag.value);
  inputTag.value = '';
  return false;
}
function loginGoogle() {
  window.location.href = "/auth/google";
}
