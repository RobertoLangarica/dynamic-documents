import { getRepository } from 'typeorm'
import { User } from 'src/user/user.entity'
import { build, Suite, user1 } from '../test-utils'
import { NoTokenProfile, NoTokenDelete, UserCanSignUp, NoDuplicatedSignup, PasswordOmittedInSignupResponse, UserCanLogin, LoginWrongPassword, LoginWrongEmail, NoCredentialsSignup, UserRetrieveProfile, ProfileWithNoPassword, UserCanLogout, LogoutAfterLogout, ProfileAfterLogout } from './auth/auth.test'
import { NoUserGetAllValidations, NoUserGetOneValidation, NoUserCreateValidation, NoUserUpdateValidation, AllValidations, AllEmptyValidations, GetOneValidation, ValidationWrongID, ValidationMalformedUUID, UpdateValidationWrongID, UpdateValidationMalformedUUID, UpdateValidationDuplicatedName, CreateIncompleteValidation, CreateValidation, CreateDuplicatedValidation, UpdateValidation, DeleteValidationWrongID, DeleteValidationMalformedUUID, DeleteValidation } from './validation/validations.test'
import { NoUserGetAllFieldType, NoUserGetOneFieldType, NoUserCreateFieldType, NoUserUpdateFieldType, NoUserDeleteFieldType, AllFieldTypes, AllEmptyFieldTypes, GetOneFieldType, FieldTypeWrongID, FieldTypeMalformedUUID, UpdateFieldType, UpdateFieldTypeDuplicatedName, UpdateFieldTypeMalformedUUID, UpdateFieldTypeWrongID, CreateDuplicatedFieldType, CreateIncompleteFieldType, CreateFieldType, DeleteFieldType, DeleteFieldTypeMalformedUUID, DeleteFieldTypeWrongID, addFieldTypesWithRelations, GetAllFieldTypesWithValidations, GetOneFieldTypeincludingValidations, UpdateFieldTypeWithValidations, UpdatingFieldTypeNoValidationsOverwrite, CreateWithValidations, CreateWithNoDuplicatedValidations, UpdateWithValidationsNameOrID, UpdateWithNoDuplicatedValidations, UpdateToRemoveValidations, CreateWithNonExistingValidations, UpdatewithNonExistingValidations, NoOrphanValidations } from './field_type/field_type.test'
import { addTransformationsWithRelations, T_NoUserGetAll, T_NoUserGetOne, T_NoUserCreate, T_NoUserUpdate, T_NoUserDelete, T_GetAll, T_GetAllEmpty, T_GetOne, T_GetOneWrongID, T_GetOneMalformedUUID, T_UpdateWrongID, T_UpdateMalformedUUID, T_UpdateDuplicatedName, T_Update, T_CreateIncomplete, T_Create, T_CreateDuplicated, T_DeleteWrongID, T_DeleteMalformedUUID, T_Delete, T_GetAllWithRelations, T_GetOneWithRelations, T_UpdateWithRelations, T_UpdateNoRelationsOverwrite, T_CreateWithRelations, T_CreateWithNoDuplicatedRelations, T_UpdateWithNoDuplicatedRelations, T_UpdateWithRelationsNameOrID, T_UpdateToRemoveRelations, T_UpdateWithNonExistingRelations, T_CreateWithNonExistingRelations, T_NoOrphanRelations } from './transformation/transformation.test'
import { addCategories, C_NoUserGetAll, C_NoUserGetOne, C_NoUserCreate, C_NoUserUpdate, C_NoUserDelete, C_GetAll, C_GetAllEmpty, C_GetOne, C_GetOneWrongID, C_GetOneMalformedUUID, C_UpdateWrongID, C_UpdateMalformedUUID, C_UpdateDuplicatedName, C_Update, C_CreateIncomplete, C_Create, C_CreateDuplicated, C_DeleteWrongID, C_DeleteMalformedUUID, C_Delete } from './category/categories.test'
import { addTemplateTypes, TT_NoUserGetAll, TT_NoUserGetOne, TT_NoUserCreate, TT_NoUserUpdate, TT_NoUserDelete, TT_GetAll, TT_GetAllEmpty, TT_GetOne, TT_GetOneWrongID, TT_GetOneMalformedUUID, TT_UpdateWrongID, TT_UpdateMalformedUUID, TT_UpdateDuplicatedName, TT_Update, TT_CreateIncomplete, TT_Create, TT_CreateDuplicated, TT_DeleteWrongID, TT_DeleteMalformedUUID, TT_Delete } from './template_type/template_type.test'
import { addStatuses, S_NoUserGetAll, S_NoUserGetOne, S_NoUserCreate, S_NoUserUpdate, S_NoUserDelete, S_GetAll, S_GetAllEmpty, S_GetOne, S_GetOneWrongID, S_GetOneMalformedUUID, S_UpdateWrongID, S_UpdateMalformedUUID, S_UpdateDuplicatedName, S_Update, S_CreateIncomplete, S_Create, S_CreateDuplicated, S_DeleteWrongID, S_DeleteMalformedUUID, S_Delete } from './status/status.test'
import { addTemplates, Tmp_NoUserGetAll, Tmp_NoUserGetOne, Tmp_NoUserCreate, Tmp_NoUserUpdate, Tmp_NoUserDelete, Tmp_GetAll, Tmp_GetAllEmpty, Tmp_GetOne, Tmp_GetOneWrongID, Tmp_GetOneMalformedUUID, Tmp_UpdateWrongID, Tmp_UpdateMalformedUUID, Tmp_UpdateDuplicatedName, Tmp_CreateIncomplete, Tmp_Update, Tmp_Create, Tmp_CreateDuplicated, Tmp_DeleteWrongID, Tmp_DeleteMalformedUUID, Tmp_Delete } from './template/template_CRUD.test'
import { addDocuments, Doc_NoUserGetAll, Doc_NoUserGetOne, Doc_NoUserCreate, Doc_NoUserUpdate, Doc_NoUserDelete, Doc_GetAll, Doc_GetAllEmpty, Doc_GetOne, Doc_GetOneWrongID, Doc_GetOneMalformedUUID, Doc_UpdateWrongID, Doc_UpdateMalformedUUID, Doc_UpdateDuplicatedName, Doc_Update, Doc_CreateIncomplete, Doc_Create, Doc_CreateDuplicated, Doc_DeleteWrongID, Doc_DeleteMalformedUUID, Doc_Delete, setDocumentsInitialStatus } from './document/document_CRUD.test'
import { addFilters, DocF_ExpireWrongID, DocF_ExpireMalformedUUID, DocF_Expire, DocF_NoUserGetAll, DocF_NoUserGetOne, DocF_NoUserCreate, DocF_NoUserUpdate, DocF_NoUserDelete, DocF_NoUserExpire, DocF_GetAll, DocF_GetAllEmpty, DocF_GetOne, DocF_GetOneWrongID, DocF_GetOneMalformedUUID, DocF_UpdateWrongID, DocF_UpdateMalformedUUID, DocF_UpdateDuplicatedName, DocF_Update, DocF_CreateIncomplete, DocF_Create, DocF_CreateDuplicated, DocF_DeleteWrongID, DocF_DeleteMalformedUUID, DocF_Delete } from './doc_filter/doc_filter_CRUD.test'

describe('End2End tests', () => {
  let suite: Suite

  // APP and DB start
  beforeAll(() => {
    return build().then(res => suite = res)
  })

  // Adding a user to login with
  beforeAll(() => {
    // Add user 1
    const repo = getRepository(User, suite.db.name)
    let user = repo.create(user1)
    return repo.save(user)
  })

  afterAll(() => suite.app.close())

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

  /****TRANSFORMATION CONTROLLER*****/
  describe('Transformations test', () => {
    beforeAll(() => addTransformationsWithRelations(suite))

    test('Get all without user should fail', async () => await T_NoUserGetAll(suite))
    test('Get one without user should fail', async () => await T_NoUserGetOne(suite))
    test('Create one without user should fail', async () => await T_NoUserCreate(suite))
    test('Update one without user should fail', async () => await T_NoUserUpdate(suite))
    test('Delete one without user should fail', async () => await T_NoUserDelete(suite))
    test('Get all', async () => await T_GetAll(suite))
    test('Get all when there is none, should return an empty array', async () => await T_GetAllEmpty(suite))
    test('Get one', async () => await T_GetOne(suite))
    test('Get one with wrong ID should fail', async () => await T_GetOneWrongID(suite))
    test('Get one with malformed UUID should fail', async () => await T_GetOneMalformedUUID(suite))
    test('Update with wrong ID should fail', async () => await T_UpdateWrongID(suite))
    test('Update with malformed UUID should fail', async () => await T_UpdateMalformedUUID(suite))
    test('Update with duplicated name should fail', async () => await T_UpdateDuplicatedName(suite))
    test('Update', async () => await T_Update(suite))
    test('Create with incomplete data should fail', async () => await T_CreateIncomplete(suite))
    test('Create', async () => await T_Create(suite))
    test('Create with duplicated name should fail', async () => await T_CreateDuplicated(suite))
    test('Delete with wrong ID should fail', async () => await T_DeleteWrongID(suite))
    test('Delete with malformed UUID should fail', async () => await T_DeleteMalformedUUID(suite))
    test('Delete', async () => await T_Delete(suite))
    test('Get all, should include the related entities', async () => await T_GetAllWithRelations(suite))
    test('Get one, should include the related relations', async () => await T_GetOneWithRelations(suite))
    test('Update one, with related relations should include the full relations on return', async () => await T_UpdateWithRelations(suite))
    test('Update properties without sending relations should not overwrite the existing relations', async () => await T_UpdateNoRelationsOverwrite(suite))
    test('Create with relations should work with id or name and should retrieve full relations', async () => await T_CreateWithRelations(suite))
    test('Create with no duplicated relations', async () => await T_CreateWithNoDuplicatedRelations(suite))
    test('Update with no duplicated relations', async () => await T_UpdateWithNoDuplicatedRelations(suite))
    test('Update with relations should support names or ids', async () => await T_UpdateWithRelationsNameOrID(suite))
    test('Update could empty the related relations', async () => await T_UpdateToRemoveRelations(suite))
    test('Update with non existing relations', async () => await T_UpdateWithNonExistingRelations(suite))
    test('Create with non existing relations', async () => await T_CreateWithNonExistingRelations(suite))
    test('No orphan relations with relations', async () => await T_NoOrphanRelations(suite))
  })
  /************************/

  /****CATEGORY CONTROLLER*****/
  describe('Categories test', () => {
    beforeAll(() => addCategories(suite))

    test('Get all without user should fail', async () => await C_NoUserGetAll(suite))
    test('Get one without user should fail', async () => await C_NoUserGetOne(suite))
    test('Create one without user should fail', async () => await C_NoUserCreate(suite))
    test('Update one without user should fail', async () => await C_NoUserUpdate(suite))
    test('Delete one without user should fail', async () => await C_NoUserDelete(suite))
    test('Get all', async () => await C_GetAll(suite))
    test('Get all when there is none, should return an empty array', async () => await C_GetAllEmpty(suite))
    test('Get one', async () => await C_GetOne(suite))
    test('Get one with wrong ID should fail', async () => await C_GetOneWrongID(suite))
    test('Get one with malformed UUID should fail', async () => await C_GetOneMalformedUUID(suite))
    test('Update with wrong ID should fail', async () => await C_UpdateWrongID(suite))
    test('Update with malformed UUID should fail', async () => await C_UpdateMalformedUUID(suite))
    test('Update with duplicated name should fail', async () => await C_UpdateDuplicatedName(suite))
    test('Update', async () => await C_Update(suite))
    test('Create with incomplete data should fail', async () => await C_CreateIncomplete(suite))
    test('Create', async () => await C_Create(suite))
    test('Create with duplicated name should fail', async () => await C_CreateDuplicated(suite))
    test('Delete with wrong ID should fail', async () => await C_DeleteWrongID(suite))
    test('Delete with malformed UUID should fail', async () => await C_DeleteMalformedUUID(suite))
    test('Delete', async () => await C_Delete(suite))
  })
  /************************/


  /****TEMPLATE TYPE CONTROLLER*****/
  describe('Template types test', () => {
    beforeAll(() => addTemplateTypes(suite))

    test('Get all without user should fail', async () => await TT_NoUserGetAll(suite))
    test('Get one without user should fail', async () => await TT_NoUserGetOne(suite))
    test('Create one without user should fail', async () => await TT_NoUserCreate(suite))
    test('Update one without user should fail', async () => await TT_NoUserUpdate(suite))
    test('Delete one without user should fail', async () => await TT_NoUserDelete(suite))
    test('Get all', async () => await TT_GetAll(suite))
    test('Get all when there is none, should return an empty array', async () => await TT_GetAllEmpty(suite))
    test('Get one', async () => await TT_GetOne(suite))
    test('Get one with wrong ID should fail', async () => await TT_GetOneWrongID(suite))
    test('Get one with malformed UUID should fail', async () => await TT_GetOneMalformedUUID(suite))
    test('Update with wrong ID should fail', async () => await TT_UpdateWrongID(suite))
    test('Update with malformed UUID should fail', async () => await TT_UpdateMalformedUUID(suite))
    test('Update with duplicated name should fail', async () => await TT_UpdateDuplicatedName(suite))
    test('Update', async () => await TT_Update(suite))
    test('Create with incomplete data should fail', async () => await TT_CreateIncomplete(suite))
    test('Create', async () => await TT_Create(suite))
    test('Create with duplicated name should fail', async () => await TT_CreateDuplicated(suite))
    test('Delete with wrong ID should fail', async () => await TT_DeleteWrongID(suite))
    test('Delete with malformed UUID should fail', async () => await TT_DeleteMalformedUUID(suite))
    test('Delete', async () => await TT_Delete(suite))
  })
  /************************/


  /****STATUS CONTROLLER*****/
  describe('Status test', () => {
    beforeAll(() => addStatuses(suite))

    test('Get all without user should fail', async () => await S_NoUserGetAll(suite))
    test('Get one without user should fail', async () => await S_NoUserGetOne(suite))
    test('Create one without user should fail', async () => await S_NoUserCreate(suite))
    test('Update one without user should fail', async () => await S_NoUserUpdate(suite))
    test('Delete one without user should fail', async () => await S_NoUserDelete(suite))
    test('Get all', async () => await S_GetAll(suite))
    test('Get all when there is none, should return an empty array', async () => await S_GetAllEmpty(suite))
    test('Get one', async () => await S_GetOne(suite))
    test('Get one with wrong ID should fail', async () => await S_GetOneWrongID(suite))
    test('Get one with malformed UUID should fail', async () => await S_GetOneMalformedUUID(suite))
    test('Update with wrong ID should fail', async () => await S_UpdateWrongID(suite))
    test('Update with malformed UUID should fail', async () => await S_UpdateMalformedUUID(suite))
    test('Update with duplicated name should fail', async () => await S_UpdateDuplicatedName(suite))
    test('Update', async () => await S_Update(suite))
    test('Create with incomplete data should fail', async () => await S_CreateIncomplete(suite))
    test('Create', async () => await S_Create(suite))
    test('Create with duplicated name should fail', async () => await S_CreateDuplicated(suite))
    test('Delete with wrong ID should fail', async () => await S_DeleteWrongID(suite))
    test('Delete with malformed UUID should fail', async () => await S_DeleteMalformedUUID(suite))
    test('Delete', async () => await S_Delete(suite))
  })
  /************************/

  /********TEMPLATE********/
  describe('TEMPLATES', () => {
    beforeAll(() => addTemplates(suite))

    describe('crud', () => {
      test('Get all without user should fail', async () => await Tmp_NoUserGetAll(suite))
      test('Get one without user should fail', async () => await Tmp_NoUserGetOne(suite))
      test('Create one without user should fail', async () => await Tmp_NoUserCreate(suite))
      test('Update one without user should fail', async () => await Tmp_NoUserUpdate(suite))
      test('Delete one without user should fail', async () => await Tmp_NoUserDelete(suite))
      test('Get all', async () => await Tmp_GetAll(suite))
      test('Get all when there is none, should return an empty array', async () => await Tmp_GetAllEmpty(suite))
      test('Get one', async () => await Tmp_GetOne(suite))
      test('Get one with wrong ID should fail', async () => await Tmp_GetOneWrongID(suite))
      test('Get one with malformed UUID should fail', async () => await Tmp_GetOneMalformedUUID(suite))
      test('Update with wrong ID should fail', async () => await Tmp_UpdateWrongID(suite))
      test('Update with malformed UUID should fail', async () => await Tmp_UpdateMalformedUUID(suite))
      test('Update with duplicated name should fail', async () => await Tmp_UpdateDuplicatedName(suite))
      test('Update', async () => await Tmp_Update(suite))
      test('Create with incomplete data should fail', async () => await Tmp_CreateIncomplete(suite))
      test('Create', async () => await Tmp_Create(suite))
      test('Create with duplicated name should fail', async () => await Tmp_CreateDuplicated(suite))
      test('Delete with wrong ID should fail', async () => await Tmp_DeleteWrongID(suite))
      test('Delete with malformed UUID should fail', async () => await Tmp_DeleteMalformedUUID(suite))
      test('Delete', async () => await Tmp_Delete(suite))
    })
  })
  /************************/

  /********DOCUMENTS********/
  describe('DOCUMENTS', () => {
    beforeAll(() => setDocumentsInitialStatus(suite))
    beforeAll(() => addDocuments(suite))

    describe('crud', () => {
      test('Get all without user should fail', async () => await Doc_NoUserGetAll(suite))
      test('Get one without user should fail', async () => await Doc_NoUserGetOne(suite))
      test('Create one without user should fail', async () => await Doc_NoUserCreate(suite))
      test('Update one without user should fail', async () => await Doc_NoUserUpdate(suite))
      test('Delete one without user should fail', async () => await Doc_NoUserDelete(suite))
      test('Get all', async () => await Doc_GetAll(suite))
      test('Get all when there is none, should return an empty array', async () => await Doc_GetAllEmpty(suite))
      test('Get one', async () => await Doc_GetOne(suite))
      test('Get one with wrong ID should fail', async () => await Doc_GetOneWrongID(suite))
      test('Get one with malformed UUID should fail', async () => await Doc_GetOneMalformedUUID(suite))
      test('Update with wrong ID should fail', async () => await Doc_UpdateWrongID(suite))
      test('Update with malformed UUID should fail', async () => await Doc_UpdateMalformedUUID(suite))
      test('Update with duplicated name should fail', async () => await Doc_UpdateDuplicatedName(suite))
      test('Update', async () => await Doc_Update(suite))
      test('Create with incomplete data should fail', async () => await Doc_CreateIncomplete(suite))
      test('Create', async () => await Doc_Create(suite))
      test('Create with duplicated name should fail', async () => await Doc_CreateDuplicated(suite))
      test('Delete with wrong ID should fail', async () => await Doc_DeleteWrongID(suite))
      test('Delete with malformed UUID should fail', async () => await Doc_DeleteMalformedUUID(suite))
      test('Delete', async () => await Doc_Delete(suite))
    })
  })
  /************************/

  /********DOCUMENT FILTER********/
  describe('Documents FILTER', () => {
    beforeAll(() => setDocumentsInitialStatus(suite))
    beforeAll(() => addDocuments(suite))
    beforeAll(() => addFilters(suite))

    describe('crud', () => {
      test('Get all without user should fail', async () => await DocF_NoUserGetAll(suite))
      test('Get one without user should fail', async () => await DocF_NoUserGetOne(suite))
      test('Create one without user should fail', async () => await DocF_NoUserCreate(suite))
      test('Update one without user should fail', async () => await DocF_NoUserUpdate(suite))
      test('Delete one without user should fail', async () => await DocF_NoUserDelete(suite))
      test('Expire one without user should fail', async () => await DocF_NoUserExpire(suite))
      test('Get all', async () => await DocF_GetAll(suite))
      test('Get all when there is none, should return an empty array', async () => await DocF_GetAllEmpty(suite))
      test('Get one', async () => await DocF_GetOne(suite))
      test('Get one with wrong ID should fail', async () => await DocF_GetOneWrongID(suite))
      test('Get one with malformed UUID should fail', async () => await DocF_GetOneMalformedUUID(suite))
      test('Update with wrong ID should fail', async () => await DocF_UpdateWrongID(suite))
      test('Update with malformed UUID should fail', async () => await DocF_UpdateMalformedUUID(suite))
      test('Update with duplicated name should fail', async () => await DocF_UpdateDuplicatedName(suite))
      test('Update', async () => await DocF_Update(suite))
      test('Create with incomplete data should fail', async () => await DocF_CreateIncomplete(suite))
      test('Create', async () => await DocF_Create(suite))
      test('Create with duplicated name should fail', async () => await DocF_CreateDuplicated(suite))
      test('Delete with wrong ID should fail', async () => await DocF_DeleteWrongID(suite))
      test('Delete with malformed UUID should fail', async () => await DocF_DeleteMalformedUUID(suite))
      test('Delete', async () => await DocF_Delete(suite))
      test('Expire with wrong ID should fail', async () => await DocF_ExpireWrongID(suite))
      test('Expire with malformed UUID should fail', async () => await DocF_ExpireMalformedUUID(suite))
      test('Expire', async () => await DocF_Expire(suite))
    })
  })
  /************************/

})
