class Config {
  get access() {
    return process.env.access || '';
  }
  get secret() {
    return process.env.SECRET || '';
  }
}
module.exports = {
  Config,
};
