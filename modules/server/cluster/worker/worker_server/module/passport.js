var Strategy = require('passport-local').Strategy;
var GoogleStrategy = require('passport-google-oauth20').Strategy;

exports.localStrategy = function(db) {
  return new Strategy(
    function(username, password, cb) {
      db.user.createGuest(function(err, user) {
        return cb(null, user);
      });
      // db.users.createGuest(username, password, function(user) {
      //   return cb(null, user);
      // });
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
      db.user.findOrCreateGoogle(profile, function(err, user) {
        return cb(err, user);
      })
    });
}

exports.serialize = function() {
  return function(user, cb) {
    cb(null, user.id);
  }
}

exports.deserialize = function(db) {
  return function(id, cb) {
    db.user.findById(id, function(err, user) {
      if (err) return cb(err);
      cb(null, user);
    })
    // db.users.findById(id, function (err, user) {
    //   if (err) { return cb(err); }
    //   cb(null, user);
    // });
  }
}
