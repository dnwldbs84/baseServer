(function(){function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s}return e})()({1:[function(require,module,exports){
(function (global){
var WebSocket = global.WebSocket || global.MozWebSocket;

function WebSocketClient(){
  // this.isFirst = true;
	this.number = 0;	// Message number
	this.autoReconnectInterval = 2 * 1000;	// ms
}
WebSocketClient.prototype.open = function(url){
	this.url = url;
	this.instance = new WebSocket(this.url);
  // this.instance.binaryType = 'arraybuffer';
  this.instance.onopen = onSocketOpenHandler.bind(this);
  this.instance.onmessage = onSocketMessageHandler.bind(this);
  this.instance.onclose = onSocketCloseHandler.bind(this);
  this.instance.onerror = onSocketErrorHandler.bind(this);
}
WebSocketClient.prototype.send = function(data,option){
	try{
		this.instance.send(data,option);
	}catch (e){
		this.instance.emit('error',e);
	}
}
WebSocketClient.prototype.reconnect = function(e){
	console.warn('WebSocketClient: retry ',e);
  this.instance.onopen = new Function();
  this.instance.onmessage = new Function();
  this.instance.onclose = new Function();
  this.instance.onerror = new Function();
	var that = this;
	setTimeout(function(){
		console.warn("WebSocketClient: reconnecting...");
		that.open(that.url);
	},this.autoReconnectInterval);
}
WebSocketClient.prototype.close = function(e){
	this.instance.close(e);
}
WebSocketClient.prototype.onopen = function(e){	console.log("WebSocketClient: open", arguments);	}
WebSocketClient.prototype.onmessage = function(data,flags,number){	console.log("WebSocketClient: message", arguments);	}
WebSocketClient.prototype.onerror = function(e){	console.log("WebSocketClient: error", arguments);	}
WebSocketClient.prototype.onclose = function(e){	console.log("WebSocketClient: closed", arguments);	}

module.exports = WebSocketClient;

function onSocketOpenHandler(){
  // if(this.isFirst){
  this.onopen();
  // }else{
    // this.emit('needReconnect');
  // }
  // this.isFirst = false;
}
function onSocketMessageHandler(data,flags){
  this.number ++;
  this.onmessage(data,flags,this.number);
}
function onSocketErrorHandler(e){
  switch (e.code){
  case 'ECONNREFUSED':
    this.reconnect(e);
    break;
  default:
    this.onerror(e);
    break;
  }
}
function onSocketCloseHandler(e){
  switch (e){
  case 1000:	// CLOSE_NORMAL
    console.warn("WebSocket: closed");
    break;
  default:	// Abnormal closure
    this.reconnect(e);
    break;
  }
  // this.close();
  this.onclose(e);
}

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],2:[function(require,module,exports){
exports.tryAjax = function(route, reqData, cb) {
  var req = createRequest();
  req.onreadystatechange = function(e) {
    if(req.readyState === 4) {
      if(req.status === 200) {
        cb(req);
      }
    }
  }
  try {
    req.open('POST', route, true);
    req.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    req.send(reqData);
  } catch (e) {
    console.warn(e.message);
  }
}

function createRequest() {
  var request;
  try {
    request = new XMLHttpRequest();
  } catch (e) {
    try {
      request = new ActiveXObject('Msxml2.XMLHTTP');
    } catch (innerE) {
      request = new ActiveXObject('Microsoft.XMLHTTP');
    }
  }
  return request;
}

},{}],3:[function(require,module,exports){
exports.UI = require('./ui');
exports.Ajax = require('./ajax.js');
exports.WebSocket = require('./WebSocket.js');

},{"./WebSocket.js":1,"./ajax.js":2,"./ui":4}],4:[function(require,module,exports){
exports.mainScene = require('./mainScene.js');

},{"./mainScene.js":5}],5:[function(require,module,exports){
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

},{}],6:[function(require,module,exports){
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

},{"../../modules/client":3}]},{},[6]);
