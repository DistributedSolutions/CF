const winston = require('winston');

var myCustomLevels = {
  levels: {
    debug: 0,
    info: 1,
    warn: 2,
    error: 3
  },
  colors: {
    debug: 'blue',
    info: 'green',
    warn: 'yellow',
    error: 'red'
  }
};
const logger = new(winston.Logger)({
    level: 'debug',
    levels: myCustomLevels.levels,
    transports: [
        // setup console logging
        new(winston.transports.Console)({
            level: 'info', // Only write logs of info level or higher
            levels: myCustomLevels.levels,
            colorize: true
        })]});

exports = module.exports = {
  log: function (level, str) {
    var d = new Date();
    var pre = d.getMonth() + "/" + d.getDay() + "/" + d.getFullYear() + " " + 
      d.getHours() + ":" + d.getMinutes() + "." + d.getMilliseconds() + ": ";
    logger[level](pre + str);
  }
}

exports.INFO = "info",
exports.DEBUG = "debug",
exports.ERROR = "error";