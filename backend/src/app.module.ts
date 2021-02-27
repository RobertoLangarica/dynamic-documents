import { MiddlewareConsumer, Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { TypeOrmModule } from '@nestjs/typeorm'
import ormConfig from '../database/ormconfig'
import { UserModule } from './user/user.module'
import { AuthModule } from './auth/auth.module'
import { AuthMiddleware } from './common/middleware/auth.middleware'
import { APISecretModule } from './api_secret/api_secret.module'
import { ValidationModule } from './validations/validation.module'
import { FieldTypeModule } from './field_types/field_type.module'
import { TransformationModule } from './transformations/transformation.module'
import { CategoryModule } from './categories/category.module'
import { TemplateModule } from './templates/template.module'
import { StatusModule } from './status/status.module'
import { DocumentModule } from './document/document.module'
import { DocumentFilterModule } from './document_filter/doc_filter.module'
import { FilesModule } from './files/files.module';
import { FillmapModule } from './fillmaps/fillmap.module'

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot(ormConfig()),
    UserModule,
    AuthModule,
    APISecretModule,
    ValidationModule,
    FieldTypeModule,
    TransformationModule,
    CategoryModule,
    TemplateModule,
    StatusModule,
    DocumentModule,
    DocumentFilterModule,
    FilesModule,
    FillmapModule
  ],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(AuthMiddleware).forRoutes('*')
  }
}
