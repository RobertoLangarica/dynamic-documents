const { Client } = require('pg')

const config = {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: 'postgres'
}

const pgclient = new Client(config)

console.log(config)

pgclient.connect()

pgclient.query(`CREATE DATABASE ${process.env.DB_DATABASE}`, (err, res) => {
    if (err) throw err
})