var http = require('http'),
    express = require('express'),
    app = express();
    passport = require('passport'),
    flash = require('connect-flash'),
    serverModule = require('./module'),
    db = require('./db');

var session = require('express-session'),
    RedisStore = require('connect-redis')(session),
    redisUrl = process.env.REDISTOGO_URL || 'redis://127.0.0.1:6379';

exports.createServer = function() {
  initServerSetting();
  initRouter();
  db.user.connectDB();
  var server = http.createServer(app);
  // return app;
  return server;
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

  var redisClient = require('redis').createClient(redisUrl);

  redisClient.on('error', function(err) {
    console.log(err);
  });

  app.use(session({
    store: new RedisStore({ client: redisClient, db: 15, ttl: 24 * 60 * 60 }),
    secret: '!!@@Secret Cat@@!!',
    resave: false,
    saveUninitialized: true
  }));

  app.use(function(req, res, next) {
    if(!req.session) {
      return next(new Error('cant find session'));
    }
    next();
  });

  app.use(flash());

  app.use(express.static('./public'));
    //path.join(__dirname, 'public')));

  app.use(passport.initialize());
  app.use(passport.session());

  //error handle
  app.use(function(error, req, res, next) {
    console.log(error.stack);
    res.status(500).send('Something broke!');
    // res.json({ message: error.message });
  });
}

function initRouter() {
  app.get('/', serverModule.router.getMain);

  // for test
  app.get('/flash', function(req, res) {
    req.flash('info', 'Flash is back!')
    // res.end();
    res.redirect('/');
  });

  app.post('/play-as-guest',
    passport.authenticate('local', { failureRedirect: '/failToLogin' }),
    serverModule.router.postPlayAsGuest);

  app.post('/logout', serverModule.router.postLogout);

  app.post('/profile',
    require('connect-ensure-login').ensureLoggedIn(),
    serverModule.router.postProfile);

  app.post('/leave-game',
    require('connect-ensure-login').ensureLoggedIn(),
    // passport.authenticate('local', { failureRedirect: '/failToLogin' }),
    serverModule.router.postLeaveGame);

  app.get('/failToLogin', serverModule.router.getFailToLogin);

  // passport route
  app.get('/auth/google',
    passport.authenticate('google', { scope: ['profile'] }));

  app.get('/auth/google/callback',
    passport.authenticate('google', { failureRedirect: '/failToLogin' }),
    serverModule.router.getAuthSuccess);


  // router event handle
  serverModule.router.onUserLeaveGame = function(user) {
    db.user.deleteUser(user);
  }
}
