'use strict'

const { default: mongoose } = require('mongoose')
const os = require('os')
const process = require('process')
const _SECOND = 5000

// count Connect
const countConnect = () => {
    const numConnection = mongoose.connection.length
    console.log(`Number of connections ${numConnection} `)
}

// check over load
const checkOverload = () => {
    setInterval(() => {
        const numConnection = mongoose.connections.length
        const numCore = os.cpus().length
        const memoryUsage = process.memoryUsage.rss()
        // Example maximum number of connections based on number of cores
        const maxConnection = numCore * 5

        console.log(`Active connection: ${numConnection}`)
        console.log(`Memory usage:: ${memoryUsage / 1024 / 1024} MB`)

        if (numConnection > maxConnection) {
            console.log(`Connection overload detected!`)
            //notify.send(...)
        }
    }, _SECOND) // Monitor every 5 seconds
}

module.exports = {
    countConnect,
    checkOverload,
}
