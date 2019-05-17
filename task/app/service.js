const { Shell } = require('./shell');
class Service {
  generateClientSSL() {
    return new Shell().spawn('scripts/x');
  }
  getFile(path) {
    return new Shell().spawn('/bin/cat', [path]);
  }
}
module.exports = {
  Service,
};
