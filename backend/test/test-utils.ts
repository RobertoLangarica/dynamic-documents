import { Test, TestingModule } from '@nestjs/testing'
import { AppModule } from '../src/app.module'
import { INestApplication, ValidationPipe, HttpStatus } from '@nestjs/common'
import { GlobalExceptionsFilter } from '../src/common/filters/exceptions.filter'
import { Connection, QueryRunner } from 'typeorm'
import * as request from 'supertest'


export class Suite {
  app: INestApplication
  db: Connection
  runner: QueryRunner
}

export async function build(): Promise<Suite> {
  const suite = new Suite()

  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
  }).compile()

  // Creating an app with the compiled module (in this case AppModule includes the whole app)
  suite.app = moduleFixture.createNestApplication()

  // This configurations is the same used in the main.ts
  suite.app.setGlobalPrefix('api')
  suite.app.useGlobalPipes(new ValidationPipe({ whitelist: true }))
  suite.app.useGlobalFilters(new GlobalExceptionsFilter())

  suite.db = moduleFixture.get(Connection)
  suite.runner = suite.db.createQueryRunner('master')
  await suite.app.init()

  return suite
}

export let user1 = {
  email: 'test@nequ.dev',
  password: '12345678',
  first_name: 'Ne',
  last_name: 'Qu'
}

export let user2 = {
  email: 'test2@nequ.dev',
  password: '12345678',
  first_name: 'Second',
  last_name: 'User'
}

export let user3 = {
  email: 'test3@nequ.dev',
  password: '12345678',
  first_name: 'Number',
  last_name: '3'
}

export let randomUser = () => {
  return {
    email: `test_${Math.round(Math.random() * 999999999)}@nequ.dev`,
    password: `${Math.round(Math.random() * 999999999)}`,
    first_name: 'User',
    last_name: 'user'
  }
}

export let getValiduserToken = async (suite: Suite) => {
  let token
  await request(suite.app.getHttpServer())
    .post('/api/login')
    .send(user1)
    .expect(HttpStatus.CREATED)
    .expect(res => expect(res.body).toMatchObject({ token: expect.any(String) }))
    .expect(res => token = res.body.token)

  return token
}