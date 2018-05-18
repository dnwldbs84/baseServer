var workerServer = require('./worker_server');

var publicModule = require('../../../public');
var pub = null, clients = [];

exports.initWorker = function() {
  var server = workerServer.server.createServer();
  workerServer.redis.initRedis(redisMessageHandler);
  pub = workerServer.redis.getPublisher();
  workerServer.socket.initSocket(server, socketMessageHandler);
  clients = workerServer.socket.getClients();
  server.listen(3000);
}

function redisMessageHandler(channel, strData) {
  console.log('on redis message : ' + strData);
  var data = JSON.parse(strData);

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
    default:
      console.log('cant find type[redis onmessage]');
  }
}

function socketMessageHandler(packet) {
  console.log('on socket message : ' + packet);
  var data = publicModule.encoder.decodePacket(packet, true);
  switch (data.type) {
    case publicModule.config.MESSAGE_TYPE.CHAT_TO_SELF:
      this.send(packet);
      break;
    default:
      pub.publish('global', JSON.stringify(data));
  }
}
