class Config {
  get access() {
    return process.env.ACCESS || require('./env').ACCESS;
  }
  get secret() {
    return process.env.SECRET || require('./env').SECRET;
  }
}
module.exports = {
  Config,
};
