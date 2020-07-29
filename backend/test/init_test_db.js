const { Client } = require('pg')

const pgclient = new Client({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: 'postgres'
})

pgclient.connect()

pgclient.query(`CREATE DATABASE ${process.env.DB_DATABASE}`, (err, res) => {
    if (err) throw err
})