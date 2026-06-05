type LogLevel = "debug" | "info" | "warn" | "error";

interface LogMeta {
  [key: string]: unknown;
}

interface Logger {
  debug: (msg: string, meta?: LogMeta) => void;
  info: (msg: string, meta?: LogMeta) => void;
  warn: (msg: string, meta?: LogMeta) => void;
  error: (msg: string, meta?: LogMeta) => void;
  child: (parentMeta: LogMeta) => Logger;
}

function emit(level: LogLevel, message: string, meta?: LogMeta) {
  const line = {
    level,
    time: new Date().toISOString(),
    message,
    ...meta,
  };
  const json = JSON.stringify(line);
  if (level === "error") {
    console.error(json);
  } else if (level === "warn") {
    console.warn(json);
  } else if (level === "debug") {
    console.debug(json);
  } else {
    console.log(json);
  }
}

function createLogger(parentMeta: LogMeta = {}): Logger {
  return {
    debug: (msg: string, m?: LogMeta) => emit("debug", msg, { ...parentMeta, ...m }),
    info: (msg: string, m?: LogMeta) => emit("info", msg, { ...parentMeta, ...m }),
    warn: (msg: string, m?: LogMeta) => emit("warn", msg, { ...parentMeta, ...m }),
    error: (msg: string, m?: LogMeta) => emit("error", msg, { ...parentMeta, ...m }),
    child: (childMeta: LogMeta) => createLogger({ ...parentMeta, ...childMeta }),
  };
}

export const logger = createLogger();
