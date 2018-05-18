// var mysql = require('mysql');
var mysql = null;
exports.setMysql = function(sql) {
  mysql = sql;
}

exports.insertData = function(conn, table, data, cb) {
  var query = 'INSERT INTO ' + table + ' SET ?';
  var values = data;
  query = mysql.format(query, values);
  tryTransaction(conn, query, function(result) {
      if (cb) {
        cb(result);
      }
    });
}

exports.findData = function(conn, table, where, column, cb) {
  conn.query('SELECT * FROM ' + table + ' WHERE ' + where + '=' + column, function(err, result, field) {
    if (err) throw err;
    cb(result[0]);
    // return result[0];
  });
}

exports.findLastID = function(conn, table, cb) {
  conn.query('SELECT id FROM ' + table + ' ORDER BY id DESC LIMIT 1', function(err, result, field) {
    if (err) throw err;
    cb(result[0].id);
  })
}

exports.deleteUser = function(conn, table, where, value, cb) {
  var query = 'DELETE FROM ' + table + ' WHERE ' + where + ' = ' + value;
  tryTransaction(conn, query, function(result) {
      if (cb) {
        cb(result);
      }
    });
}

function tryTransaction(conn, query, cb) {
  conn.beginTransaction(function (err) {
    if (err) { throw err; }
    else {
      conn.query(query, function(err, result) {
        if (err) {
          return conn.rollback(function() {
            try {
              throw err;
            } catch (e) {
              console.error(e);
            }
            // throw err;
          });
        }

        conn.commit(function(err) {
          if (err) {
            return conn.rollback(function() {
              try {
                throw err;
              } catch (e) {
                console.error(e);
              }
              // throw err;
            });
          }
          cb(result);
        })
      });
    }
  })
}
