var mysql = require('mysql');
var setting = {
  host: 'localhost',
  user: 'root',
  password: '0000',
  database: 'world'
};

var conn = null;
var model = require('./model');

exports.connectDB = function() {
  conn = mysql.createConnection(setting);
  conn.connect();
  console.log('mysql connect success');
}

exports.findOrCreateGoogle = function(profile, cb) {
  process.nextTick(function() {
    conn.query('SELECT * FROM user WHERE googleId=' + profile.id, function(err, result, field) {
      if (err) throw err;
      if (!result[0]) {
        console.log('google profile');
        console.log(profile);
        //create user
        var user = {
          googleId: profile.id,
          username: 'google',
          displayName: 'google',
          email: 'google.com'
        }
        conn.query('INSERT INTO user SET ?', user, function(err, innerResult1) {
          if(err) { console.log(err); }
          else {
            conn.query('SELECT * FROM user WHERE id=' + result.insertId, function(err, innerResult2, field) {
              if (err) throw err;
              else {
                user.id = innerResult2[0].insertId;
                cb(null, user);
              }
            })
          }
        });
        // cb(null, user);
      } else {
        cb(null, result[0]);
      }
    })
    // cb(null, record);
  });
}

exports.createGuest = function(cb) {
  process.nextTick(function() {
    var user = {
    	username: 'Guest',
    	displayName: 'Guest',
    	email: 'Guest@example.net'
    }
    conn.query('INSERT INTO user SET ?', user, function(err, result) {
      if (err) {
        console.log(err);
      } else {
        if(result.affectedRows) {
          user.id = result.insertId;
          cb(null, user);
        }
      }
    })
  });
}

exports.findById = function(id, cb) {
  process.nextTick(function() {
    conn.query('SELECT * FROM user WHERE id=' + id, function(err, result, field) {
      if (err) throw err;
      return cb(null, result[0]);
    });
  });
}
