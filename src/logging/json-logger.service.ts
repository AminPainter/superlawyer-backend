import { Inject, Injectable, LoggerService } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { config } from 'src/config/config';
import { getRequestContext } from 'src/logging/request-context';

type Level = 'fatal' | 'error' | 'warn' | 'log' | 'debug' | 'verbose';

const LEVEL_PRIORITY: Record<Level, number> = {
  fatal: 0,
  error: 1,
  warn: 2,
  log: 3,
  debug: 4,
  verbose: 5,
};

@Injectable()
export class JsonLogger implements LoggerService {
  private readonly isProduction: boolean;
  private readonly minPriority: number;

  constructor(
    @Inject(config.KEY)
    envConfig: ConfigType<typeof config>,
  ) {
    this.isProduction = envConfig.app.nodeEnv === 'production';
    this.minPriority = this.isProduction
      ? LEVEL_PRIORITY.log
      : LEVEL_PRIORITY.verbose;
  }

  log(message: unknown, ...optionalParams: unknown[]): void {
    this.write('log', message, optionalParams);
  }

  error(message: unknown, ...optionalParams: unknown[]): void {
    this.write('error', message, optionalParams);
  }

  warn(message: unknown, ...optionalParams: unknown[]): void {
    this.write('warn', message, optionalParams);
  }

  debug(message: unknown, ...optionalParams: unknown[]): void {
    this.write('debug', message, optionalParams);
  }

  verbose(message: unknown, ...optionalParams: unknown[]): void {
    this.write('verbose', message, optionalParams);
  }

  fatal(message: unknown, ...optionalParams: unknown[]): void {
    this.write('fatal', message, optionalParams);
  }

  private write(level: Level, message: unknown, optionalParams: unknown[]): void {
    if (LEVEL_PRIORITY[level] > this.minPriority) return;

    // NestJS Logger appends its context name as the trailing string param.
    // For error(), the first string in optionalParams is the stack trace.
    const params = [...optionalParams];
    let context: string | undefined;
    if (params.length && typeof params[params.length - 1] === 'string') {
      context = params.pop() as string;
    }
    let trace: string | undefined;
    if (level === 'error' && params.length && typeof params[0] === 'string') {
      trace = params.shift() as string;
    }

    const reqCtx = getRequestContext();
    const entry: Record<string, unknown> = {
      level,
      timestamp: new Date().toISOString(),
    };
    if (context) entry.context = context;
    if (reqCtx?.requestId) entry.requestId = reqCtx.requestId;
    if (reqCtx?.userId) entry.userId = reqCtx.userId;

    if (typeof message === 'string') {
      entry.message = message;
    } else if (message instanceof Error) {
      entry.message = message.message;
      entry.stack = message.stack;
    } else if (message && typeof message === 'object') {
      Object.assign(entry, message);
    } else {
      entry.message = String(message);
    }

    if (trace) entry.trace = trace;

    for (const extra of params) {
      if (extra instanceof Error) {
        entry.errorMessage = extra.message;
        entry.stack ??= extra.stack;
      } else if (extra && typeof extra === 'object') {
        Object.assign(entry, extra);
      }
    }

    const stream =
      level === 'error' || level === 'fatal' ? process.stderr : process.stdout;

    if (this.isProduction) {
      stream.write(JSON.stringify(entry) + '\n');
    } else {
      stream.write(this.pretty(level, entry) + '\n');
    }
  }

  private pretty(level: Level, entry: Record<string, unknown>): string {
    const {
      level: _level,
      timestamp,
      context,
      requestId,
      userId,
      message,
      stack,
      trace,
      ...rest
    } = entry;
    const ctxLabel = context ? ` [${String(context)}]` : '';
    const reqLabel = requestId
      ? ` req=${String(requestId).slice(0, 8)}`
      : '';
    const userLabel = userId ? ` user=${String(userId)}` : '';
    const meta = Object.keys(rest).length ? ' ' + JSON.stringify(rest) : '';
    let line = `${String(timestamp)} ${level.toUpperCase().padEnd(7)}${ctxLabel}${reqLabel}${userLabel} ${String(message ?? '')}${meta}`;
    if (stack) line += `\n${String(stack)}`;
    else if (trace) line += `\n${String(trace)}`;
    return line;
  }
}
