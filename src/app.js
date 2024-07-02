const express = require('express')
const morgan = require('morgan')
const helmet = require('helmet')
const compression = require('compression')
const app = express()

// init middlewares
app.use(morgan('dev'))
app.use(helmet())
app.use(compression())
app.use(express.json())
app.use(
    express.urlencoded({
        extended: true,
    })
)

// init db
require('./dbs/init.mongodb')
const { checkOverload } = require('./helpers/check.connect')
checkOverload()

// init router
app.use('/', require('./routes'))

// handling errors

app.use((req, res, next) => {
    const error = new Error('Not Found app')
    error.status = 404
    next(error)
}) // middleware

app.use((error, req, res, next) => {
    const statusCode = error.status || 500
    return res.status(statusCode).json({
        status: 'error',
        code: statusCode,
        // stack: error.stack,
        message: error.message || 'Internal Server Error',
    })
}) // handle func

module.exports = app
