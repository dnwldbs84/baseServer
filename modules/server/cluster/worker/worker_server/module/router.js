exports.onUserLeaveGame = new Function();

exports.getMain = function(req, res) {
  // console.log('in get main');
  // console.log(req.session);
  // console.log(req.flash('info'));
  res.render('index', { user: req.user });
  if(req.user) {
    // console.log(req.user);
  }
}

exports.postPlayAsGuest = function(req, res) {
  res.send({ user: req.user });
}

exports.postLogout = function(req, res) {
  req.session.destroy(function (err) {
    res.clearCookie('connect.sid');
    res.redirect('/');
  });
}

exports.postLeaveGame = function(req, res) {
  req.session.destroy(function (err) {
    // var user = req.user;
    exports.onUserLeaveGame(req.user);
    res.clearCookie('connect.sid');
    res.redirect('/');
  });
}

exports.postProfile = function(req, res) {
  res.send({ user: req.user });
}

exports.getAuthSuccess = function(req, res) {
  res.redirect('/');
}

exports.getFailToLogin = function(req, res) {
  res.redirect('/');
  // res.send('Fail To Login');
}
