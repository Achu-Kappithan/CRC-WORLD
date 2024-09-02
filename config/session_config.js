require('dotenv').config();
const session = require('express-session')

const session_config = session({

        secret: process.env.SESSIONSECRECT,
        resave: false,
        saveUninitialized: true,
    
})

module.exports = session_config;