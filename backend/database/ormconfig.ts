import { ConnectionOptions } from 'typeorm'
import { User } from 'src/user/user.entity'
import { Token } from 'src/auth/token.entity'
import { Grant } from 'src/user/grant.entity'
import { APISecret } from 'src/api_secret/api_secret.entity'
import { Validation } from 'src/validations/validation.entity'
import { FieldType } from 'src/field_types/field_type.entity'
import { Transformation } from 'src/transformations/transformation.entity'
import { Category } from 'src/categories/category.entity'
import { Status } from 'src/status/status.entity'
import { Document } from 'src/document/document.entity'
import { DocumentFilter } from 'src/document_filter/doc_filter.entity'
import { Fillmap } from 'src/fillmaps/fillmap.entity'

const config = (): ConnectionOptions => {
  let config: ConnectionOptions = {
    type: 'postgres',
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT),
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    logging: false,
    entities: [
      User, 
      Token,
      Grant, 
      APISecret, 
      Validation, 
      FieldType, 
      Transformation, 
      Category, 
      Status, 
      Document, 
      DocumentFilter,
      Fillmap
    ],
    synchronize: false,
    migrations: process.env.NODE_ENV === 'test' ? ['../database/migrations/*.ts'] : undefined
  }
  if (process.env.NODE_ENV === 'dev') console.log(`DBConfig:`,config)

  return config;
}

export = config
