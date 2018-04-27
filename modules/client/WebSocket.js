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
