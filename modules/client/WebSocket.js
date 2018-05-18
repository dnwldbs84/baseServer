var WebSocket = global.WebSocket || global.MozWebSocket;
// var publicModule = require('../public');
// publicModule.setting.initSetting();

function WebSocketClient(){
  // this.isFirst = true;
	this.number = 0;	// Message number
	this.autoReconnectInterval = 2 * 1000;	// ms
}
WebSocketClient.prototype.open = function(url){
	this.url = url;
	this.instance = new WebSocket(this.url);
  this.instance.binaryType = 'arraybuffer';
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
	if (this.instance) {
		this.instance.close(e);
	}
}
WebSocketClient.prototype.onopen = function(e){	console.log("WebSocketClient: open", arguments);	}
WebSocketClient.prototype.onmessage = function(data,flags,number){	console.log("WebSocketClient: message", arguments);	}
WebSocketClient.prototype.onerror = function(e){	console.log("WebSocketClient: error", arguments);	}
WebSocketClient.prototype.onclose = function(e){	console.log("WebSocketClient: closed", arguments);	}

// var textEncoder = new TextEncoder(),
// 		textDecoder = new TextDecoder('utf-8');

// WebSocketClient.prototype.encodePacket = function(type, data) {
// 	if (type == 1) {
// 		// case chat
// 		return textEncoder.encode(publicModule.config.MESSAGE_DATA_TYPE.STRING + data);
// 	} else if(type == 2) {
// 		// case int array
// 		var buffer = new Uint8Array(data.length + 1);
// 		buffer[0] = publicModule.config.MESSAGE_DATA_TYPE.INTEGER.charCodeAt(0);
// 		for(var i=1; i<buffer.length; i++) {
// 			buffer[i] = data.substr(i-1 ,1);
// 		}
// 		return buffer;
// 	}
// }
// WebSocketClient.prototype.decodePacket = function(data) {
// 	// if(data.substring(0, 1) == 1) {
// 		// case chat
// 		// return textDecoder.decode(data);
// 		var array = new Uint8Array(data);
//
// 		if (array[0] == 1) {
// 			return textDecoder.decode(array);
// 		} else if (array[0] == 2) {
// 			var data = '';
// 			for (var i=0; i<array.length; i++) {
// 				data += array[i].toString();
// 			}
// 			return data;
// 		}
// 	// } else if(data.charCodeAt(0) == 2) {
// 	// 	var intArray = [];
// 	// 	var stringData = '';
// 	// 	for (var i=0; i<data.length; i++) {
// 	// 		intArray[i] = data.charCodeAt(i);
// 	// 		stringData += intArray[i];
// 	// 	}
// 	// 	return stringData;
// 	// 	// case int array
// 	// }
// }

module.exports = WebSocketClient;

// var textEncoder = new TextEncoder();
// var textDecoder = new TextDecoder('utf-8');
//
// exports.encodePacket = function(type, data) {
// 	if(type == 1) {
// 		// case chat
// 		return textEncoder.encode('1' + data);
// 	} else if(type == 2) {
// 		// case int array
//
// 	}
// }
// exports.decodePacket = function(data) {
// 	if(data[0] == 1) {
// 		// case chat
// 		return textDecoder.decode(data.splice(0, 1));
// 	} else if(data[0] == 2) {
// 		// case int array
// 	}
// }
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
