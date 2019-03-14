// Control-log. isomorphic server/client logging.

import {Logger} from 'meteor/ostrio:logger';
import {LoggerConsole} from 'meteor/ostrio:loggerconsole';

export const serverLog = data => {
  const logger = new Logger();
  new LoggerConsole(this.logger).enable();
  if (typeof data === 'string') {
    logger.info(JSON.stringify({data, time: Date.now()}));
  } else if (Object.keys.length > 0) {
    logger.info(JSON.stringify({...data, time: Date.now()}));
  } else {
    logger.info(JSON.stringify({data, time: Date.now()}));
  }
};
