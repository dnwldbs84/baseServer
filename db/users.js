var records = [
    { id: 1, username: 'jack', password: 'secret', displayName: 'Jack', emails: [ { value: 'jack@example.com' } ] }
  , { id: 2, username: 'jill', password: 'birthday', displayName: 'Jill', emails: [ { value: 'jill@example.com' } ] }
];

exports.findOrCreate = function(profile, cb) {
  process.nextTick(function() {
    var record = null;
    for(var i=0; i<records.length; i++){
      if(records[i].id == profile.id){
        record = records[i];
        break;
      }
    }
    if(!record){
      record = {
        id: profile.id, username: 'dn', password: 'none', displayName: 'none', emails: [ { value: 'w@example.com' } ]
      };
      records.push(record);
    }
    cb(null, record);
  });
}
exports.createGuest = function(name, pwd, cb) {
  console.log('createGuest');
  process.nextTick(function() {
    var id = Math.floor(Math.random() * 10000 + 10);
    var record = {
      id: id, username: name, password: pwd, displayName: 'Guest', emails: [ { value: 'Guest@example.com' } ]
    }
    records.push(record);
    cb(record);
  });
}
exports.findById = function(id, cb) {
  process.nextTick(function() {
    for(var i=0; i<records.length; i++){
      if(records[i].id == id){
        return cb(null, records[i]);
      }
    }
    cb(new Error('User' + id + ' does not exist'));
    // var idx = id - 1;
    // if (records[idx]) {
    //   cb(null, records[idx]);
    // } else {
    //   cb(new Error('User ' + id + ' does not exist'));
    // }
  });
}

exports.findByUsername = function(username, cb) {
  process.nextTick(function() {
    for (var i = 0, len = records.length; i < len; i++) {
      var record = records[i];
      if (record.username === username) {
        return cb(null, record);
      }
    }
    return cb(null, null);
  });
}
