// var workers = process.env.WORKERS || require('os').cpus().length;

exports.initMaster = function(cluster) {
  console.log('start cluster');
  // for (var i = 0; i < workers; i++) {
  //   var worker = cluster.fork();
  //   console.log('worker %s started.', worker.process.pid);
  // }
  cluster.on('message', function(worker, msg) {
    // console.log('Master onmessage ' + msg);
    // for(var index in cluster.workers) {
    //   cluster.workers[index].send(msg);
    // }
  });
  cluster.on('exit', function(worker, code, signal) {
    console.log(`worker %s died`, worker.process.pid);
  });
  // cluster.on('death', function(worker) {
  //   console.log('worker %s died. restart...', worker.process.pid);
  // });
}
