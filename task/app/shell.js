const { spawn } = require('child_process');
class Shell {
  promise() {
    const promise = {};
    promise.instance = new Promise((...argv) => {
      [promise.resolve, promise.reject] = argv;
    });
    return promise;
  }
  spawn(command, params, options) {
    const run = {
      buffer: new Uint8Array(0),
      getLength(...argv) {
        let length = 0;
        argv.forEach(segment => {
          length += segment.length;
        });
        return length;
      },
      append(...argv) {
        const buffer = new Uint8Array(this.getLength(this.buffer, ...argv));
        let pos = 0;
        [this.buffer, ...argv].forEach(segment => {
          buffer.set(segment, pos);
          pos += segment.length;
        });
        return this.buffer = buffer;
      },
    };
    const promise = this.promise();
    const proc = spawn(command, params, Object.assign({ shell: true }, options));
    proc.stdout.on('data', data => run.append(data));
    proc.on('close', code => {
      const res = { code, stdout: Buffer.from(run.buffer) };
      if (code) promise.reject(res);
      promise.resolve(res);
    });
    return promise.instance;
  }
  example() {
    if (typeof logger !== 'object') global.logger = console;
    logger.info({ RUN: 'start' });
    return new Shell().spawn('ls -l ; sleep', ['1'])
    .then(data => logger.info(data.stdout.toString()));
  }
}
module.exports = {
  Shell,
};
