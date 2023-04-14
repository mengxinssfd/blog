import * as Log4js from 'log4js';
import * as Util from 'util';
// import * as Moment from 'moment';
import Chalk from 'chalk';
import config from '@/config/log4js';
import * as StackTrace from 'stacktrace-js';
import { formatDate } from '@tool-pack/basic';
import { ENV } from '@/utils/utils';

export enum LoggerLevel {
  ALL = 'ALL',
  MARK = 'MARK',
  TRACE = 'TRACE',
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
  FATAL = 'FATAL',
  OFF = 'OFF',
}

export class ContextTrace {
  constructor(
    public readonly context: string,
    public readonly path?: string,
    public readonly lineNumber?: number,
    public readonly columnNumber?: number,
  ) {}
}

Log4js.addLayout('blog', (logConfig) => {
  return (logEvent): string => {
    let moduleName = '';
    let position = '';

    // 日志组装
    const messageList: string[] = [];
    logEvent.data.forEach((value) => {
      if (value instanceof ContextTrace) {
        moduleName = value.context;
        // 显示触发日志的坐标（行，列）
        if ((value.lineNumber as number) ** (value.columnNumber as number)) {
          position = `${value.lineNumber},${value.columnNumber}`;
        }
        return;
      }

      if (typeof value !== 'string') {
        value = Util.inspect(value, false, 3, true);
      }
      messageList.push(value);
    });
    // 日志组成部分
    const messageOutput: string = messageList.join(' ');
    const positionOutput: string = position ? ` [${position}]` : '';
    const typeOutput = `[${logConfig.type}] ${logEvent.pid.toString()}   - `;
    const dateOutput = `${formatDate(logEvent.startTime)}`;
    const moduleOutput: string = moduleName ? `[${moduleName}] ` : '[LoggerService] ';
    let levelOutput = `[${logEvent.level}] ${messageOutput}`;

    // 根据日志级别，用不同颜色区分
    switch (logEvent.level.toString()) {
      case LoggerLevel.DEBUG:
        levelOutput = Chalk.green(levelOutput);
        break;
      case LoggerLevel.INFO:
        levelOutput = Chalk.cyan(levelOutput);
        break;
      case LoggerLevel.WARN:
        levelOutput = Chalk.yellow(levelOutput);
        break;
      case LoggerLevel.ERROR:
        levelOutput = Chalk.red(levelOutput);
        break;
      case LoggerLevel.FATAL:
        levelOutput = Chalk.hex('#DD4C35')(levelOutput);
        break;
      default:
        levelOutput = Chalk.grey(levelOutput);
        break;
    }

    return `${Chalk.green(typeOutput)}${dateOutput}  ${Chalk.yellow(
      moduleOutput,
    )}${levelOutput}${positionOutput}`;
  };
});

// 注入配置
Log4js.configure(config);

// 实例化
const logger = Log4js.getLogger();
logger.level = LoggerLevel.TRACE;

export class Logger {
  static trace(...args: any[]) {
    logger.trace(Logger.getStackTrace(), ...args);
  }

  static debug(...args: any[]) {
    logger.debug(Logger.getStackTrace(), ...args);
  }

  static log(...args: any[]) {
    logger.info(Logger.getStackTrace(), ...args);
  }

  static info(...args: any[]) {
    // 没什么用，打包后全都是一个main.js
    // const trace = Logger.getStackTrace();
    logger.info('\n', ...args);
    ENV.isDev() && console.log(...args);
  }

  static warn(...args: any[]) {
    logger.warn(Logger.getStackTrace(), ...args);
  }

  static warning(...args: any[]) {
    logger.warn(Logger.getStackTrace(), ...args);
  }

  static error(...args: any[]) {
    logger.error(Logger.getStackTrace(), ...args);
  }

  static fatal(...args: any[]) {
    logger.fatal(Logger.getStackTrace(), ...args);
  }

  static access(...args: any[]) {
    const loggerCustom = Log4js.getLogger('http');
    loggerCustom.info(Logger.getStackTrace(), ...args);
  }

  // 日志追踪，可以追溯到哪个文件、第几行第几列
  private static getStackTrace(deep = 2): string {
    const stackList: StackTrace.StackFrame[] = StackTrace.getSync();
    const stackInfo: StackTrace.StackFrame | undefined = stackList[deep];

    if (!stackInfo) return 'no stack trace(getStackTrace)';

    const { lineNumber, columnNumber, fileName = '' } = stackInfo;

    const filename = /node_modules/.test(fileName)
      ? fileName.replace(/^.+\/node_modules/, 'node_modules')
      : fileName;

    return `${filename}(line: ${lineNumber}, column: ${columnNumber}): \n`;
  }
}
