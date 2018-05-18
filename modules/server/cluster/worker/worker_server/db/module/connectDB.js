// var mysql = require('mysql');
// replace to file
var setting = {
  host: 'localhost',
  user: 'root',
  password: '0000',
  database: 'world'
};

exports.connect = function(mysql) {
  conn = mysql.createConnection(setting);
  conn.connect();
  return conn;
}
