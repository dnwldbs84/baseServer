var workers = process.env.WORKERS || require('os').cpus().length,
    serverModule = require('./modules/server');

var cluster = require('cluster'); // Only required if you want the worker id
var sticky = require('sticky-session');
var port = process.env.PORT || 3000;

var app = serverModule.server.initServer();
var server = require('http').createServer(app);

if (!sticky.listen(server, port)) {
  // Master code
  server.once('listening', function() {
    serverModule.master.initMaster(cluster);
    console.log('server started on %d port', port);
  });
} else {
  // Worker code
  serverModule.worker.initWorker(server);
}
