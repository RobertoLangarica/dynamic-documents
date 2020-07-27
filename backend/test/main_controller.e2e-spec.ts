import { getRepository } from 'typeorm'
import { User } from '../src/user/user.entity'
import { build, Suite, user1 } from './test-utils'
import { NoTokenProfile, NoTokenDelete, UserCanSignUp, NoDuplicatedSignup, PasswordOmittedInSignupResponse, UserCanLogin, LoginWrongPassword, LoginWrongEmail, NoCredentialsSignup, UserRetrieveProfile, ProfileWithNoPassword, UserCanLogout, LogoutAfterLogout, ProfileAfterLogout } from './auth.test'
import { NoUserGetAllValidations, NoUserGetOneValidation, NoUserCreateValidation, NoUserUpdateValidation, AllValidations, AllEmptyValidations, GetOneValidation, ValidationWrongID, ValidationMalformedUUID, UpdateValidationWrongID, UpdateValidationMalformedUUID, UpdateValidationDuplicatedName, CreateIncompleteValidation, CreateValidation, CreateDuplicatedValidation, UpdateValidation, DeleteValidationWrongID, DeleteValidationMalformedUUID, DeleteValidation } from './validations.test'
import { NoUserGetAllFieldType, NoUserGetOneFieldType, NoUserCreateFieldType, NoUserUpdateFieldType, NoUserDeleteFieldType, AllFieldTypes, AllEmptyFieldTypes, GetOneFieldType, FieldTypeWrongID, FieldTypeMalformedUUID, UpdateFieldType, UpdateFieldTypeDuplicatedName, UpdateFieldTypeMalformedUUID, UpdateFieldTypeWrongID, CreateDuplicatedFieldType, CreateIncompleteFieldType, CreateFieldType, DeleteFieldType, DeleteFieldTypeMalformedUUID, DeleteFieldTypeWrongID, addFieldTypesWithRelations, GetAllFieldTypesWithValidations, GetOneFieldTypeincludingValidations, UpdateFieldTypeWithValidations, UpdatingFieldTypeNoValidationsOverwrite, CreateWithValidations, CreateWithNoDuplicatedValidations, UpdateWithValidationsNameOrID, UpdateWithNoDuplicatedValidations, UpdateToRemoveValidations, CreateWithNonExistingValidations, UpdatewithNonExistingValidations, NoOrphanValidations } from './field_type.test'

describe('End2End tests', () => {
  let suite: Suite

  // APP and DB start
  beforeAll(async () => { suite = await build() })

  // Adding a user to login with
  beforeAll(() => {
    // Add user 1
    const repo = getRepository(User, suite.db.name)
    let user = repo.create(user1)
    return repo.save(user)
  })

  afterAll(async () => await suite.app.close())

  // Cleanup
  afterAll(() => suite.runner.query(' DELETE FROM users;'))

  /****AUTH CONTROLLER*****/
  describe('Auth test', () => {
    test('Profile should fail without token', async () => await NoTokenProfile(suite))
    test('Logout should fail without token', async () => await NoTokenDelete(suite))
    test('User can signup', async () => await UserCanSignUp(suite))
    test('No duplicated signup', async () => await NoDuplicatedSignup(suite))
    test('Signup without email or password whould fail', async () => await NoCredentialsSignup(suite))
    test('Password omitted in response from signup', async () => await PasswordOmittedInSignupResponse(suite))
    test('Existing user should login', async () => await UserCanLogin(suite))
    test('Login with wrong password should fail', async () => await LoginWrongPassword(suite))
    test('Login with wrong email should fail', async () => await LoginWrongEmail(suite))
    test('Retrieve profile using token', async () => await UserRetrieveProfile(suite))
    test('Retrieved user profile should ommit the password', async () => await ProfileWithNoPassword(suite))
    test('User can logout', async () => await UserCanLogout(suite))
    test('Retrieve profile after logout should fail', async () => await ProfileAfterLogout(suite))
    test('Try to logout after logout should fail', async () => await LogoutAfterLogout(suite))

    // Cleanup
    afterAll(() => suite.runner.query(' DELETE FROM users WHERE email != $1;', [user1.email]))

  })
  /************************/


  /****VALIDATIONS CONTROLLER*****/
  describe('Validations test', () => {
    test('Get all without user should fail', async () => await NoUserGetAllValidations(suite))
    test('Get one without user should fail', async () => await NoUserGetOneValidation(suite))
    test('Create one without user should fail', async () => await NoUserCreateValidation(suite))
    test('Update one without user should fail', async () => await NoUserUpdateValidation(suite))
    test('Delete one without user should fail', async () => await NoUserUpdateValidation(suite))
    test('Get all validations', async () => await AllValidations(suite))
    test('Get all validations when there is none, should return an empty array', async () => await AllEmptyValidations(suite))
    test('Get one validation', async () => await GetOneValidation(suite))
    test('Get one with wrong ID should fail', async () => await ValidationWrongID(suite))
    test('Get one with malformed UUID should fail', async () => await ValidationMalformedUUID(suite))
    test('Update with wrong ID should fail', async () => await UpdateValidationWrongID(suite))
    test('Update with malformed UUID should fail', async () => await UpdateValidationMalformedUUID(suite))
    test('Update with duplicated name should fail', async () => await UpdateValidationDuplicatedName(suite))
    test('Update validation', async () => await UpdateValidation(suite))
    test('Create incomplete validation should fail', async () => await CreateIncompleteValidation(suite))
    test('Create validation', async () => await CreateValidation(suite))
    test('Create with duplicated name should fail', async () => await CreateDuplicatedValidation(suite))
    test('Delete with wrong ID should fail', async () => await DeleteValidationWrongID(suite))
    test('Delete with malformed UUID should fail', async () => await DeleteValidationMalformedUUID(suite))
    test('Delete validation', async () => await DeleteValidation(suite))
  })
  /************************/


  /****FIELD TYPE CONTROLLER*****/
  describe('Field types test', () => {
    beforeAll(() => addFieldTypesWithRelations(suite))

    test('Get all without user should fail', async () => await NoUserGetAllFieldType(suite))
    test('Get one without user should fail', async () => await NoUserGetOneFieldType(suite))
    test('Create one without user should fail', async () => await NoUserCreateFieldType(suite))
    test('Update one without user should fail', async () => await NoUserUpdateFieldType(suite))
    test('Delete one without user should fail', async () => await NoUserDeleteFieldType(suite))
    test('Get all', async () => await AllFieldTypes(suite))
    test('Get all when there is none, should return an empty array', async () => await AllEmptyFieldTypes(suite))
    test('Get one', async () => await GetOneFieldType(suite))
    test('Get one with wrong ID should fail', async () => await FieldTypeWrongID(suite))
    test('Get one with malformed UUID should fail', async () => await FieldTypeMalformedUUID(suite))
    test('Update with wrong ID should fail', async () => await UpdateFieldTypeWrongID(suite))
    test('Update with malformed UUID should fail', async () => await UpdateFieldTypeMalformedUUID(suite))
    test('Update with duplicated name should fail', async () => await UpdateFieldTypeDuplicatedName(suite))
    test('Update', async () => await UpdateFieldType(suite))
    test('Create with incomplete data should fail', async () => await CreateIncompleteFieldType(suite))
    test('Create', async () => await CreateFieldType(suite))
    test('Create with duplicated name should fail', async () => await CreateDuplicatedFieldType(suite))
    test('Delete with wrong ID should fail', async () => await DeleteFieldTypeWrongID(suite))
    test('Delete with malformed UUID should fail', async () => await DeleteFieldTypeMalformedUUID(suite))
    test('Delete', async () => await DeleteFieldType(suite))
    test('Get all, should include the related validations', async () => await GetAllFieldTypesWithValidations(suite))
    test('Get one, should include the related validations', async () => await GetOneFieldTypeincludingValidations(suite))
    test('Update one, with related validations should include the full validations on return', async () => await UpdateFieldTypeWithValidations(suite))
    test('Update properties without sending validations should not overwrite the existing validations', async () => await UpdatingFieldTypeNoValidationsOverwrite(suite))
    test('Create with validations should work with id or name and should retrieve full validations', async () => await CreateWithValidations(suite))
    test('Create with no duplicated validations', async () => await CreateWithNoDuplicatedValidations(suite))
    test('Update with no duplicated validations', async () => await UpdateWithNoDuplicatedValidations(suite))
    test('Update with validations should support names or ids', async () => await UpdateWithValidationsNameOrID(suite))
    test('Update could empty the related validations', async () => await UpdateToRemoveValidations(suite))
    test('Update with non existing validations', async () => await UpdatewithNonExistingValidations(suite))
    test('Create with non existing validations', async () => await CreateWithNonExistingValidations(suite))
    test('No orphan relations with validations', async () => await NoOrphanValidations(suite))
  })
  /************************/

})
