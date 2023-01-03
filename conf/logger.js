// This file is use for define a configuration of ours logs.
// This logs will help us to determine where and when an error will occure
const { createLogger, transports, format } = require("winston");
const { combine, timestamp, label, prettyPrint } = format;
const config = require("./config.js")
const CATEGORY = "habilitation Statut";

const logger = createLogger({
    level: "debug",
    format: combine(
      label({ label: CATEGORY }),
      timestamp({
        format: "MMM-DD-YYYY HH:mm:ss",
      }),
      prettyPrint()
    ),
    transports: [
      new transports.File({filename: "./logs/debug.log",}),
      new transports.File({level: "info", filename: "./logs/info.log",}),
      new transports.File({level: "error", filename: "./logs/error.log",}),
      new transports.Console(),
    ],
  });

module.exports = logger;