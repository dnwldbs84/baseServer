exports.createRequest = function(){
  var request;
  try {
    request = new XMLHttpRequest();
  } catch (e){
    try {
      request = new ActiveXObject('Msxml2.XMLHTTP');
    } catch (innerE) {
      request = new ActiveXObject('Microsoft.XMLHTTP');
    }
  }
  return request;
};

checkServerCondition : function(url){
    var req = util.createRequest();
    var startTime = Date.now();
    var thisServerConditionOn = this.serverConditionOn;
    var thisServerConditionOff = this.serverConditionOff;

    req.onreadystatechange = function(e){
      if(req.readyState === 4){
        if(req.status === 200){
          var res = JSON.parse(req.response);
          var ping = Date.now() - startTime;
          if(res.canJoin){
            if(ping < gameConfig.MAX_PING_LIMIT){
              thisServerConditionOn();
            }else{
              alert('Ping is too high! How about join to other server.');
              thisServerConditionOff();
            }
          }else{
            if(res.version !== gameConfig.GAME_VERSION){
              alert('Client`s game version is different from server`s. Reload page.');
              location.reload();
            }else if(res.isServerDown){
              alert('Server is down for update! Reload page.');
              location.reload();
            }else{
              alert('The server is currently full! How about join to other server.');
            }
            thisServerConditionOff();
          }
        }else{
          alert('Sorry. Unpredicted internet server error!');
          thisServerConditionOff();
        }
      }
    }

    try {
      startTime = Date.now();
      req.open('POST', url + '/serverCheck', true);
      req.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
      // req.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
      req.send('version=' + gameConfig.GAME_VERSION);
    } catch (e) {
      console.warn(e.message);
      console.warn(url + ' is not response');
    }
  },
req.send('ip=' + ip + '&startTime=' + Date.now() + '&optionIndex=' + optionIndex);
