import { ConnectionOptions } from 'typeorm'
import { User } from '../src/user/user.entity'
import { Token } from '../src/auth/token.entity'
import { Grant } from '../src/user/grant.entity'
import { APISecret } from '../src/api_secret/api_secret.entity'
import { Validation } from 'src/validations/validation.entity'
import { FieldType } from 'src/field_types/field_type.entity'
import { Transformation } from 'src/transformations/transformation.entity'
import { Category } from 'src/categories/category.entity'
import { TemplateType } from 'src/template_types/template_type.entity'
import { Template } from 'src/templates/template.entity'
import { Status } from 'src/status/status.entity'
import { Document } from 'src/document/document.entity'
import { DocumentFilter } from 'src/document_filter/doc_filter.entity'

const config = (): ConnectionOptions => {
  let config: ConnectionOptions = {
    type: 'postgres',
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT),
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    logging: false,
    entities: [User, Token, Grant, APISecret, Validation, FieldType, Transformation, Category, TemplateType, Template,
      Status, Document, DocumentFilter],
    synchronize: false,
    migrations: process.env.NODE_ENV === 'test' ? ['../database/migrations/*.ts'] : undefined
  }
  console.log(process.env.NODE_ENV)
  if (process.env.NODE_ENV !== 'test') console.log(config)

  return config;
}

export = config
