require('dotenv').config()
const bcrypt = require('bcrypt')
const { Client } = require('pg')


let email,password;

process.argv.forEach(arg=>{
    let s = arg.split('=')
    if(s.length === 2 ){
        switch(s[0]){
            case 'email':
                email = s[1];
                break;
            case 'password':
                password = s[1];
                break;
        }
    }
})

if(!email || !password){
    console.log('ERROR: Missing email or password')
    console.log('\tUSAGE EXAMPLE:\n')
    console.log('\tnpm run create:user email=mail@user.com password=pass')
    console.log('________________')
    process.exit(1)
}


let config = {
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST,
    database: process.env.DB_DATABASE,
    port: parseInt(process.env.DB_PORT),
  }

const client = new Client(config)
client.connect()
  .then(()=>{
    console.log('Connected')
    encrypted = bcrypt.hashSync(password, 10)
    client.query(`INSERT INTO users (email,first_name,last_name,password) VALUES ($1,$1,'',$2) RETURNING id`,[email,encrypted])
    .then(result=>{
        let user_id = result.rows[0].id
        return user_id
        
    })
    .then(id=>{
        console.log('Adding grants')
        return client.query(`INSERT INTO grants (user_id,name) VALUES ($1,'user')`,[id])
    })
    .then(()=>{
        console.log('User CREATED:')
        console.log(`email:${email}\tpassword:${password}`)
    })
    .catch(err=>{
        console.log(err)
    })
    .then(()=>{
        client.end()
        console.log('Closed DB')
    })
  })
  .catch(err=>console.log('Connection error',err.stack))