var Strategy = require('passport-local').Strategy;
var GoogleStrategy = require('passport-google-oauth20').Strategy;

exports.localStrategy = function(db) {
  return new Strategy(
    function(username, password, cb) {
      console.log('in local strategy');
      username = 'Guest';
      password = 'guestpwd'
      db.users.createGuest(username, password, function(user) {
        return cb(null, user);
      });
    });
}

exports.googleStrategy = function(db) {
  return new GoogleStrategy({
      clientID: '699894960088-f0p8l9ns2cmkq3dg4i69ta14kl7gef8o.apps.googleusercontent.com',
      clientSecret: 'eYWYb0kNl_ALGc8O54pZovcr',
      // clientID: GOOGLE_CLIENT_ID,
      // clientSecret: GOOGLE_CLIENT_SECRET,
      callbackURL: "http://localhost:3000/auth/google/callback"
    },
    function(accessToken, refreshToken, profile, cb) {
      console.log('in google strategy');
      db.users.findOrCreate(profile, function(err, user) {
        return cb(err, user);
      });
    });
}

exports.serialize = function() {
  return function(user, cb) {
    console.log('in serialize callback');
    console.log(user);
    console.log('finish serialize callback');
    cb(null, user.id);
  }
}

exports.deserialize = function(db) {
  return function(id, cb) {
    console.log('in deserialize callback');
    db.users.findById(id, function (err, user) {
      if (err) { return cb(err); }
      cb(null, user);
    });
  }
}
