var WebSocket = require('ws');

var clients = [];

exports.initSocket = function(server, cb) {
  var wss = new WebSocket.Server({ server: server, perMessageDeflate: false });

  wss.on('connection', function(client) {
    console.log('client connect at ' + process.pid);
    clients.push(client);

    client.isAlive = true;
    client.on('pong', heartbeat);

    client.on('message', cb);
    client.on('error', function(err) {
      client.close();
    });
    client.on('close', function() {
      var index = clients.indexOf(client);
      if (index !== -1) {
        clients.splice(index);
      }
    });
  });

  function heartbeat() {
    this.isAlive = true;
  }

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
}

exports.getClients = function() {
  return clients;
}
