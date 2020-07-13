import { MiddlewareConsumer, Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { TypeOrmModule } from '@nestjs/typeorm'
import * as ormConfig from '../database/ormconfig'
import { UserModule } from './user/user.module'
import { AuthModule } from './auth/auth.module'
import { AuthMiddleware } from './common/middleware/auth.middleware'
import { StoreModule } from './store/store.module'
import { APISecretModule } from './api_secret/api_secret.module'
import { ValidationModule } from './validations/validation.module'
import { FieldTypeModule } from './field_types/field_type.module'
import { TransformationModule } from './transformations/transformation.module'
import { CategoryModule } from './categories/category.module'
import { TemplateTypeModule } from './template_types/template_type.module'
import { TemplateModule } from './templates/template.module'
import { StatusModule } from './status/status.module'
import { DocumentModule } from './document/document.module'
import { DocumentFilterModule } from './document_filter/doc_filter.module'

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot(ormConfig()),
    StoreModule,
    UserModule,
    AuthModule,
    APISecretModule,
    ValidationModule,
    FieldTypeModule,
    TransformationModule,
    CategoryModule,
    TemplateTypeModule,
    TemplateModule,
    StatusModule,
    DocumentModule,
    DocumentFilterModule
  ],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(AuthMiddleware).forRoutes('*')
  }
}
