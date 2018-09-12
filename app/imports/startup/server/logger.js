import {Logger} from 'meteor/ostrio:logger';
import {LoggerConsole} from 'meteor/ostrio:loggerconsole';

// Initialize Logger:
const log = new Logger();

// Initialize and enable LoggerConsole with default settings:
new LoggerConsole(log).enable();
