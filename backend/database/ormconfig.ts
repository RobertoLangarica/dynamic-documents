import { ConnectionOptions } from 'typeorm'
import { User } from '../src/user/user.entity'
import { Token } from '../src/auth/token.entity'
import { Grant } from '../src/user/grant.entity'
import { APISecret } from '../src/api_secret/api_secret.entity'
import { Validation } from 'src/validations/validation.entity'
import { FieldType } from 'src/field_types/field_type.entity'

const config = (): ConnectionOptions => {
  let config: ConnectionOptions = {
    type: 'postgres',
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT),
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    logging: false,
    entities: [User, Token, Grant, APISecret, Validation, FieldType],
    synchronize: false
  }
  console.log(config)
  return config;
}

export = config
