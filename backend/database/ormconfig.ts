import { ConnectionOptions } from 'typeorm'
import { User } from '../src/user/user.entity'
import { Token } from '../src/auth/token.entity'
import { Grant } from '../src/user/grant.entity'
import { APISecret } from '../src/api_secret/api_secret.entity'
import { FieldType } from 'src/templates/common/field_type.entity'
import { Validation } from 'src/validations/validation.entity'

const config = (): ConnectionOptions => {
  let config: ConnectionOptions = {
    type: 'postgres',
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT),
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    logging: false,
    entities: [User, Token, Grant, APISecret, Validation],
    synchronize: false
  }
  console.log(config)
  return config;
}

export = config
