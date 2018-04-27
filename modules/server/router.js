exports.getMain = function(req, res) {
  res.render('index', { user: req.user });
  if(req.user) {
    console.log(req.user);
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

exports.postProfile = function(req, res) {
  res.send({ user: req.user });
}

exports.getAuthSuccess = function(req, res) {
  res.redirect('/');
}
