var WebSocket = require('ws'),
    redis = require('redis');

var redisUrl = process.env.REDISTOGO_URL || 'redis://127.0.0.1:6379'; //,

var pub = redis.createClient(), sub = redis.createClient(), clients = [];

sub.subscribe('global');
sub.on('message', function(channel, msg) {
  for(var i=0; i<clients.length; i++) {
    clients[i].send(msg);
  }
});

exports.initWorker = function(server) {
  initSocket(server);
}

function initSocket(server) {
  var process = this.process;
  var wss = new WebSocket.Server({ server: server, perMessageDeflate: false });
  process.on('message', function(msg) {
    // console.log('Worker onmessage ' + msg);
  });

  wss.on('connection', function(client, req){
    console.log('client connect at ' + process.pid);
    clients.push(client);

    client.isAlive = true;
    client.on('pong', heartbeat);

    client.on('message', function(data){
      pub.publish('global', data);
      process.send(data);
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
