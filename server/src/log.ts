import { createLogger, format, transports } from 'winston'

const errorFormat = format.printf((info) => {
  if (info.error) {
    return `${info.timestamp} ${info.level}: ${info.message}\n\n${info.error.stack}`
  }
  return `${info.timestamp} ${info.level}: ${info.message}`
})

const logger = createLogger({
  transports: new transports.Console({
    level: 'debug',
    format: format.combine(
      format.colorize(),
      format.timestamp(),
      errorFormat
    )
  })
})

export default logger
