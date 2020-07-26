import * as request from 'supertest'
import { HttpStatus } from "@nestjs/common"
import { Suite, getValiduserToken } from './test-utils'
import * as uuidv4 from 'uuid/v4'
import { Validation } from 'src/validations/validation.entity'


const getRandomValidation = () => {
    return {
        name: `v_${Math.round(Math.random() * 999999999)}`,
        description: `d_${Math.round(Math.random() * 999999999)}`,
        action: `a_${Math.round(Math.random() * 999999999)}`,
        error_message: `error_${Math.round(Math.random() * 999999999)}`,
        parameters: JSON.stringify({}),
    }
}

export let NoUserGetAll = async (suite: Suite) => {
    return await request(suite.app.getHttpServer())
        .get('/api/validations/')
        .expect(HttpStatus.FORBIDDEN)
}

export let NoUserGetOne = async (suite: Suite) => {
    let uuid = uuidv4()
    return await request(suite.app.getHttpServer())
        .get(`/api/validations/${uuid}`)
        .expect(HttpStatus.FORBIDDEN)
}

export let NoUserCreate = async (suite: Suite) => {
    return await request(suite.app.getHttpServer())
        .post(`/api/validations/`)
        .expect(HttpStatus.FORBIDDEN)
}

export let NoUserUpdate = async (suite: Suite) => {
    let uuid = uuidv4()
    return await request(suite.app.getHttpServer())
        .patch(`/api/validations/${uuid}`)
        .expect(HttpStatus.FORBIDDEN)
}

export let NoUserDelete = async (suite: Suite) => {
    let uuid = uuidv4()
    return await request(suite.app.getHttpServer())
        .delete(`/api/validations/${uuid}`)
        .expect(HttpStatus.FORBIDDEN)
}

export let AllValidations = async (suite: Suite) => {
    let token = await getValiduserToken(suite)

    let count = await suite.runner.query('SELECT COUNT(*) from validations')
    count = parseInt(count[0].count)
    return await request(suite.app.getHttpServer())
        .get(`/api/validations/`)
        .set({ 'Authorization': `Bearer ${token}` })
        .expect(HttpStatus.OK)
        .expect(res => expect(res.body).toMatchObject({ items: expect.anything() }))
        .expect(res => expect(Array.isArray(res.body.items)).toBe(true))
        .expect(res => expect(res.body.items).toHaveLength(count))
}

export let AllEmptyValidations = async (suite: Suite) => {
    let token = await getValiduserToken(suite)
    // Backing up the validations (so we can return an empty array and continue other tests)
    await suite.runner.query('ALTER TABLE "validations" RENAME TO "validations_backup"')
    await suite.runner.query(`CREATE TABLE "validations" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "description" character varying NOT NULL DEFAULT '', "action" character varying NOT NULL, "error_message" character varying NOT NULL, "parameters" jsonb DEFAULT '{}', CONSTRAINT "PK_Validations_Test" PRIMARY KEY ("id"))`, undefined);

    await request(suite.app.getHttpServer())
        .get(`/api/validations/`)
        .set({ 'Authorization': `Bearer ${token}` })
        .expect(HttpStatus.OK)
        .expect(res => expect(res.body).toMatchObject({ items: expect.anything() }))
        .expect(res => expect(Array.isArray(res.body.items)).toBe(true))
        .expect(res => expect(res.body.items).toHaveLength(0))

    // Recovering the previous validations
    await suite.runner.query(`DROP TABLE "validations"`, undefined);
    await suite.runner.query(`ALTER TABLE "validations_backup" RENAME TO "validations"`)
}

export let GetOneValidation = async (suite: Suite) => {
    let token = await getValiduserToken(suite)

    let validations = await suite.runner.manager.find(Validation)
    let v = validations[Math.floor((Math.random() * validations.length))]

    await request(suite.app.getHttpServer())
        .get(`/api/validations/${v.id}`)
        .set({ 'Authorization': `Bearer ${token}` })
        .expect(HttpStatus.OK)
        .expect(res => expect(res.body).toEqual(v))
}

export let ValidationWrongID = async (suite: Suite) => {
    let token = await getValiduserToken(suite)
    let id = uuidv4()
    await request(suite.app.getHttpServer())
        .get(`/api/validations/${id}`)
        .set({ 'Authorization': `Bearer ${token}` })
        .expect(HttpStatus.NOT_FOUND)
}

export let ValidationMalformedUUID = async (suite: Suite) => {
    let token = await getValiduserToken(suite)
    let id = 'wrong'
    await request(suite.app.getHttpServer())
        .get(`/api/validations/${id}`)
        .set({ 'Authorization': `Bearer ${token}` })
        .expect(HttpStatus.UNPROCESSABLE_ENTITY)
}

export let UpdateValidationWrongID = async (suite: Suite) => {
    let token = await getValiduserToken(suite)
    let id = uuidv4()
    await request(suite.app.getHttpServer())
        .patch(`/api/validations/${id}`)
        .set({ 'Authorization': `Bearer ${token}` })
        .expect(HttpStatus.NOT_FOUND)
}

export let UpdateValidationMalformedUUID = async (suite: Suite) => {
    let token = await getValiduserToken(suite)
    let id = 'wrong'
    await request(suite.app.getHttpServer())
        .patch(`/api/validations/${id}`)
        .set({ 'Authorization': `Bearer ${token}` })
        .expect(HttpStatus.UNPROCESSABLE_ENTITY)
}

export let UpdateValidationDuplicatedName = async (suite: Suite) => {
    let token = await getValiduserToken(suite)
    let validations = await suite.runner.manager.find(Validation)
    let toUpdate = { name: validations[1].name }
    let id = validations[0].id

    await request(suite.app.getHttpServer())
        .patch(`/api/validations/${id}`)
        .set({ 'Authorization': `Bearer ${token}` })
        .send(toUpdate)
        .expect(HttpStatus.CONFLICT)
}

export let UpdateValidation = async (suite: Suite) => {
    let token = await getValiduserToken(suite)
    let validation: any = getRandomValidation()

    await request(suite.app.getHttpServer())
        .post(`/api/validations/`)
        .set({ 'Authorization': `Bearer ${token}` })
        .send(validation)
        .expect(HttpStatus.CREATED)
        .expect(res => validation = res.body)

    let change = getRandomValidation()
    await request(suite.app.getHttpServer())
        .patch(`/api/validations/${validation.id}`)
        .set({ 'Authorization': `Bearer ${token}` })
        .send(change)
        .expect(HttpStatus.OK)
        .expect(res => expect(res.body).toMatchObject(change))
}

export let CreateIncompleteValidation = async (suite: Suite) => {
    let token = await getValiduserToken(suite)
    let validation = getRandomValidation()

    // Without name
    delete validation.name
    await request(suite.app.getHttpServer())
        .post(`/api/validations/`)
        .set({ 'Authorization': `Bearer ${token}` })
        .send(validation)
        .expect(HttpStatus.UNPROCESSABLE_ENTITY)

    // Without action
    validation = getRandomValidation()
    delete validation.action
    await request(suite.app.getHttpServer())
        .post(`/api/validations/`)
        .set({ 'Authorization': `Bearer ${token}` })
        .send(validation)
        .expect(HttpStatus.UNPROCESSABLE_ENTITY)

    // Without error_message
    validation = getRandomValidation()
    delete validation.error_message
    await request(suite.app.getHttpServer())
        .post(`/api/validations/`)
        .set({ 'Authorization': `Bearer ${token}` })
        .send(validation)
        .expect(HttpStatus.UNPROCESSABLE_ENTITY)
}

export let CreateValidation = async (suite: Suite) => {
    let token = await getValiduserToken(suite)
    let validation: any = getRandomValidation()

    await request(suite.app.getHttpServer())
        .post(`/api/validations/`)
        .set({ 'Authorization': `Bearer ${token}` })
        .send(validation)
        .expect(HttpStatus.CREATED)
        .expect(res => expect(res.body).toMatchObject(validation))
}

export let CreateDuplicatedValidation = async (suite: Suite) => {
    let token = await getValiduserToken(suite)
    let validation = getRandomValidation()

    await request(suite.app.getHttpServer())
        .post(`/api/validations/`)
        .set({ 'Authorization': `Bearer ${token}` })
        .send(validation)
        .expect(HttpStatus.CREATED)

    await request(suite.app.getHttpServer())
        .post(`/api/validations/`)
        .set({ 'Authorization': `Bearer ${token}` })
        .send(validation)
        .expect(HttpStatus.CONFLICT)
}

export let DeleteValidationWrongID = async (suite: Suite) => {
    let token = await getValiduserToken(suite)

    let id = uuidv4()

    await request(suite.app.getHttpServer())
        .delete(`/api/validations/${id}`)
        .set({ 'Authorization': `Bearer ${token}` })
        .expect(HttpStatus.NOT_FOUND)
}

export let DeleteValidationMalformedUUID = async (suite: Suite) => {
    let token = await getValiduserToken(suite)

    let id = 'wrong'
    await request(suite.app.getHttpServer())
        .delete(`/api/validations/${id}`)
        .set({ 'Authorization': `Bearer ${token}` })
        .expect(HttpStatus.UNPROCESSABLE_ENTITY)
}

export let DeleteValidation = async (suite: Suite) => {
    let token = await getValiduserToken(suite)
    let validations = await suite.runner.manager.find(Validation)
    let v = validations[Math.floor((Math.random() * validations.length))]

    await request(suite.app.getHttpServer())
        .delete(`/api/validations/${v.id}`)
        .set({ 'Authorization': `Bearer ${token}` })
        .expect(HttpStatus.OK)

    await request(suite.app.getHttpServer())
        .get(`/api/validations/${v.id}`)
        .set({ 'Authorization': `Bearer ${token}` })
        .expect(HttpStatus.NOT_FOUND)
}