const { Shell } = require('./shell');
class Service {
  generateClientSSL() {
    return new Shell().spawn('scripts/x');
  }
}
module.exports = {
  Service,
};
