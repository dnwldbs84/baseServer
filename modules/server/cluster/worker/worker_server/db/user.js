var mysql = require('mysql');
    conn = null;

var module = require('./module');
    model = require('./model');

exports.connectDB = function() {
  conn = module.connectDB.connect(mysql);
  if(conn) {
    module.query.setMysql(mysql);
    conn.on('error', function(err) {
      console.log(err.code);
    });
    console.log('mysql connect success');
  }
}
exports.findOrCreateGoogle = function(profile, cb) {
  process.nextTick(function() {
    module.query.findData(conn, 'user', 'googleId', profile.id, function(result) {
      if (result) {
        cb(null, result);
      } else {
        // create new user
        var user = new model.UserModel({ displayName: profile.displayName, googleId: profile.id });
        // var user = {
        //   googleId: profile.id,
        //   displayName: profile.displayName,
        // }
        module.query.insertData(conn, 'user', user, function(insertResult) {
          module.query.findData(conn, 'user', 'id', insertResult.insertId, function(findResult) {
            cb(null, findResult);
          });
        });
      }
    });
  });
}

exports.createGuest = function(cb) {
  process.nextTick(function() {
    // find id
    module.query.findLastID(conn, 'user', function(result) {
      var id = result + 1;
      // create guest
      var user = new model.UserModel({ id: id, displayName: 'Guest' + id });
      // var user = {
      //   id: id,
      //   displayName: 'Guest' + id
      // }
      module.query.insertData(conn, 'user', user, function(insertResult) {
        if (insertResult.affectedRows) {
          module.query.findData(conn, 'user', 'id', insertResult.insertId, function(findResult) {
            cb(null, findResult);
          });
        }
      });
    });
  });
}

exports.findById = function(id, cb) {
  process.nextTick(function() {
    module.query.findData(conn, 'user', 'id', id, function(result) {
      cb(null, result);
    });
  });
}

exports.deleteUser = function(user) {
  process.nextTick(function() {
    module.query.deleteUser(conn, 'user', 'id', user.id, function(result) {
      console.log(result);
    });
  });
}
