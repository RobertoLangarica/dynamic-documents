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

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot(ormConfig()),
    StoreModule,
    UserModule,
    AuthModule,
    APISecretModule,
    ValidationModule,
    FieldTypeModule
  ],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(AuthMiddleware).forRoutes('*')
  }
}
