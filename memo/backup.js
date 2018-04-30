var express = require('express'),
    app = express();
    path = require('path'),
    passport = require('passport'),
    serverModule = require('./modules/server'),
    db = require('./db');

var http = require('http'),
    cluster = require('cluster'),
    WebSocket = require('ws'),
    redis = require('redis');

var workers = process.env.WORKERS || require('os').cpus().length,
    redisUrl = process.env.REDISTOGO_URL || 'redis://127.0.0.1:6379',
    port = process.env.PORT || 3000;

passport.use(serverModule.passport.localStrategy(db));
passport.use(serverModule.passport.googleStrategy(db));
passport.serializeUser(serverModule.passport.serialize());
passport.deserializeUser(serverModule.passport.deserialize(db));

app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

app.use(serverModule.CORS.allowCORS(['http://localhost']));

app.use(require('cookie-parser')());
app.use(require('body-parser').urlencoded({ extended: true }));
app.use(require('express-session')({ secret: '!!@@Secret Cat@@!!', resave: false, saveUninitialized: false }));

app.use(express.static(path.join(__dirname, 'public')));

app.use(passport.initialize());
app.use(passport.session());

// route
app.get('/', serverModule.router.getMain);
app.post('/play-as-guest',
  passport.authenticate('local', { failureRedirect: '/' }),
  serverModule.router.postPlayAsGuest);
app.post('/logout', serverModule.router.postLogout);
app.post('/profile',
  require('connect-ensure-login').ensureLoggedIn(),
  serverModule.router.postProfile);

app.get('/auth/google',
  passport.authenticate('google', { scope: ['profile'] }));
app.get('/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/' }),
  serverModule.router.getAuthSuccess);

//cluster setting
cluster.schedulingPolicy = cluster.SCHED_RR;

if(cluster.isMaster) {
  console.log('start cluster with %s workers', workers);
  for (var i = 0; i < workers; i++) {
    var worker = cluster.fork();
    console.log('worker %s started.', worker.process.pid);
  }
  cluster.on('message', function(worker, msg) {
    // console.log(msg);
    for(var index in cluster.workers) {
      cluster.workers[index].send(msg);
    }
  });
  cluster.on('death', function(worker) {
    console.log('worker %s died. restart...', worker.process.pid);
  });
} else {
  start();
}

var pub = redis.createClient(), sub = redis.createClient(), clients = [];

sub.subscribe('global');
sub.on('message', function(channel, msg) {
  for(var i=0; i<clients.length; i++) {
    clients[i].send(msg);
  }
});

function start() {
  var httpServer = http.createServer(app);
  var server = httpServer.listen(port);
  var process = this.process;
  var wss = new WebSocket.Server({ server: server, perMessageDeflate: false });
  process.on('message', function(msg) {
    // console.log(msg);
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
          console.log('ping timeout');
          console.log(new Date());
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
