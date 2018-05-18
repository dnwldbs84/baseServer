var WebSocket = require('ws'),
    redis = require('redis');

var redisUrl = process.env.REDISTOGO_URL || 'redis://127.0.0.1:6379'; //,

// var process = this.process;

var publicModule = require('../public');

var pub = redis.createClient(redisUrl), sub = redis.createClient(redisUrl), clients = [];

sub.subscribe('global');
// sub.subscribe(process.pid);

sub.on('message', function(channel, strData) {
  var data = JSON.parse(strData);
  // console.log(data.data);
  // console.log(data.data.type); // buffer to be an object {type : 'buffer', data : [array]};
  // console.log(data.data.data);
  switch (data.type) {
    case publicModule.config.MESSAGE_TYPE.CHAT_TO_ALL:
      var buffer = publicModule.encoder.encodePacket(data.dataType, data.data);
      if (buffer) {
        for (var i=0; i<clients.length; i++) {
          clients[i].send(buffer);
        }
      }
      break;
    case publicModule.config.MESSAGE_TYPE.CHAT_TO_ROOM:
      break;
  }
  // var buffer = publicModule.encoder.encodePacket(stringData);
  // if (buffer) {
  //   for (var i=0; i<clients.length; i++) {
  //     clients[i].send(buffer);
  //   }
  // }
});

exports.initWorker = function(server) {
  initSocket(server);
}

function initSocket(server) {
  var wss = new WebSocket.Server({ server: server, perMessageDeflate: false });
  process.on('message', function(msg) {
    // console.log('Worker onmessage ' + msg);
  });

  wss.on('connection', function(client, req){
    console.log('client connect at ' + process.pid);
    clients.push(client);

    client.isAlive = true;
    client.on('pong', heartbeat);

    client.on('message', function(packet){
      var data = publicModule.encoder.decodePacket(packet, true);
      // deal private message
      switch (data.type) {
        case publicModule.config.MESSAGE_TYPE.CHAT_TO_SELF:
          break;
        default:
          pub.publish('global', JSON.stringify(data));
      }
      // pub.publish('global', data);
      // process.send(data); to master process
    });
    client.on('error', function(err) {
      client.close();
    });
    client.on('close', function() {
      var index = clients.indexOf(client);
      if(index !== -1) {
        clients.splice(index);
      }
    });

  });
  function heartbeat(){
    this.isAlive = true;
  };
  var pingpongInterval = setInterval(function(){
    try {
      wss.clients.forEach(function(client){
        if(client.isAlive === false){
          console.log('ping timeout: %s', new Date());
          // console.log(new Date());
          return client.terminate();
        }
        client.isAlive = false;
        if(client.readyState === WebSocket.OPEN){
          client.ping();
        }
      });
    } catch (e) {
      console.log('pingpongInterval Error');
    }
  }, 30000);
  console.log('Redis adapter started with url: ' + redisUrl + ' ' + process.pid);
}
