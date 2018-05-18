var http = require('http'),
    express = require('express'),
    app = express();
    passport = require('passport'),
    serverModule = require('../server'),
    db = require('../../db');

var session = require('express-session');
    RedisStore = require('connect-redis')(session);
    redisUrl = process.env.REDISTOGO_URL || 'redis://127.0.0.1:6379';
    redisClient = require('redis').createClient(redisUrl);

exports.createServer = function() {
  // connectDB();
  initServerSetting();
  initRouter();
  var server = http.createServer(app);
  // return app;
  return server;
}

function connectDB() {
  var mysql = require('mysql');
  var connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '0000',
    database: 'world'
  });
  connection.connect();
  // connection.query('SELECT * FROM user', function(err, result, field) {
  //   if (err) throw err;
  //   console.log(result);
  //   console.log(field);
  // });
  // return connection
}

function initServerSetting() {
  passport.use(serverModule.passport.localStrategy(db));
  passport.use(serverModule.passport.googleStrategy(db));
  passport.serializeUser(serverModule.passport.serialize());
  passport.deserializeUser(serverModule.passport.deserialize(db));

  app.set('views', './views');
  // __dirname + '/views');
  app.set('view engine', 'ejs');

  app.use(serverModule.CORS.allowCORS(['http://localhost']));

  app.use(require('cookie-parser')());
  app.use(require('body-parser').urlencoded({ extended: false }));
  // app.use(require('express-session')({ secret: '!!@@Secret Cat@@!!', resave: false, saveUninitialized: false }));

  app.use(session({
    store: new RedisStore({ client: redisClient, db: 15, ttl: 24 * 60 * 60 }),
    secret: '!!@@Secret Cat@@!!',
    resave: false,
    saveUninitialized: true
  }));

  // app.use(session({
  //   store: new RedisStore(options),
  //   secret: '!!@@Secret Cat@@!!',
  //   resave: false,
  //   saveUninitialized: true,
  //   cookie: {
  //     secure: true
  //   }
  //   // ,
  //   // rolling: true
  // }));
  redisClient.on('error', function(err) {
    console.log(err);
  });
  app.use(function(req, res, next) {
    if(!req.session) {
      return next(new Error('cant find session'));
    }
    next();
  });

  app.use(express.static('./public'));
    //path.join(__dirname, 'public')));

  app.use(passport.initialize());
  app.use(passport.session());
}

function initRouter() {
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
}