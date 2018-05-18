var User = function(data) {
  this.id = data.id || 0;
  this.displayName = data.displayName || '';
  this.googleId = data.googleId || 0;
}

module.exports = User
