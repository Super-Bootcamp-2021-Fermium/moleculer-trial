const winston = require("winston");

module.exports = {
    logger: {
        type: "Winston",
        options: {
           
            level: "info",

            winston: {
                transports: [
                    new winston.transports.Console(),
                    new winston.transports.File({ filename: "/logs/moleculer.log" })
                ]
            }
        }
    }
};