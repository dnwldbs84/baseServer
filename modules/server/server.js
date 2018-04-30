var express = require('express'),
    app = express();
    // path = require('path'),
    passport = require('passport'),
    serverModule = require('../server'),
    db = require('../../db');

exports.initServer = function() {
  initServerSetting();
  initRouter();
  return app;
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
  app.use(require('body-parser').urlencoded({ extended: true }));
  app.use(require('express-session')({ secret: '!!@@Secret Cat@@!!', resave: false, saveUninitialized: false }));

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
