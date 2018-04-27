exports.tryAjax = function(route, reqData, cb) {
  var req = createRequest();
  req.onreadystatechange = function(e) {
    if(req.readyState === 4) {
      if(req.status === 200) {
        cb(req);
      }
    }
  }
  try {
    req.open('POST', route, true);
    req.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    req.send(reqData);
  } catch (e) {
    console.warn(e.message);
  }
}

function createRequest() {
  var request;
  try {
    request = new XMLHttpRequest();
  } catch (e) {
    try {
      request = new ActiveXObject('Msxml2.XMLHTTP');
    } catch (innerE) {
      request = new ActiveXObject('Microsoft.XMLHTTP');
    }
  }
  return request;
}
