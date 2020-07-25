import { getRepository } from 'typeorm'
import { User } from '../src/user/user.entity'
import { build, Suite, user1 } from './test-utils'
import { NoTokenProfile, NoTokenDelete, UserCanSignUp, NoDuplicatedSignup, PasswordOmittedInSignupResponse, UserCanLogin, LoginWrongPassword, LoginWrongEmail, NoCredentialsSignup, UserRetrieveProfile, ProfileWithNoPassword, UserCanLogout, LogoutAfterLogout, ProfileAfterLogout } from './auth.test'
import { NoUserGetAll, NoUserGetOne, NoUserCreate, NoUserUpdate, AllValidations } from './validations.test'

describe('End to End tests', () => {
  let suite: Suite

  // APP and DB start
  beforeAll(async () => suite = await build())

  // Sync the DB (this clean all and rebuild schemas)
  beforeAll(async () => suite.db.synchronize(true))

  // Adding a user to login
  beforeAll(async () => {
    // Add user 1
    const repo = getRepository(User, suite.db.name)
    let user = repo.create(user1)
    return await repo.save(user)
  })

  beforeAll(async () => await suite.runner.startTransaction())
  afterAll(async () => await suite.runner.rollbackTransaction())
  afterAll(async () => await suite.app.close())

  /****AUTH CONTROLLER*****/
  describe('Auth controller', () => {
    test('Profile should fail without token', async () => await NoTokenProfile(suite))
    test('Logout should fail without token', async () => await NoTokenDelete(suite))
    test('User can signup', async () => await UserCanSignUp(suite))
    test('No duplicated signup', async () => await NoDuplicatedSignup(suite))
    test('Signup without email or password whould fail', async () => await NoCredentialsSignup(suite))
    test('Password omitted in response from signup', async () => await PasswordOmittedInSignupResponse(suite))
    test('Existing user con login', async () => await UserCanLogin(suite))
    test('Login with wrong password should fail', async () => await LoginWrongPassword(suite))
    test('Login with wrong email should fail', async () => await LoginWrongEmail(suite))
    test('Retrieve profile using token', async () => await UserRetrieveProfile(suite))
    test('Retrieved user profile should ommit the password', async () => await ProfileWithNoPassword(suite))
    test('User can logout', async () => await UserCanLogout(suite))
    test('Retrieve profile after logout should fail', async () => await ProfileAfterLogout(suite))
    test('Try to logout after logout should fail', async () => await LogoutAfterLogout(suite))

  })
  /************************/


  /****VALIDATIONS CONTROLLER*****/
  describe.only('Validations test', () => {
    test('Get all without user should fail', async () => await NoUserGetAll(suite))
    test('Get one without user should fail', async () => await NoUserGetOne(suite))
    test('Create one without user should fail', async () => await NoUserCreate(suite))
    test('Update one without user should fail', async () => await NoUserUpdate(suite))
    test('Delete one without user should fail', async () => await NoUserUpdate(suite))
    test.only('Get all validations', async () => await AllValidations(suite))
  })
  /************************/

})
