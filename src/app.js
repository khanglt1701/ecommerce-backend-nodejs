const express = require('express')
const morgan = require('morgan')
const helmet = require('helmet')
const compression = require('compression')
const app = express()

// init middlewares
app.use(morgan('dev'))
app.use(helmet())
app.use(compression())

// init db
require('./dbs/init.mongodb')
const { checkOverload } = require('./helpers/check.connect')
checkOverload()

// init router
app.get('/', (req, res, next) => {
    const str = 'Hello Tuong'

    return res.status(200).json({
        message: 'Welcome Khang!',
        metadata: str.repeat(10000),
    })
})

// handling errors

module.exports = app
