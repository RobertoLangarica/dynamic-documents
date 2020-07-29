import * as request from 'supertest'
import { QueryRunner } from 'typeorm'
import { Validation } from 'src/validations/validation.entity'
import { Suite, getValiduserToken } from './test-utils'
import { HttpStatus } from '@nestjs/common'
import { v4 as uuidv4 } from 'uuid'
import { FieldType } from 'src/field_types/field_type.entity'
import { plainToClass } from 'class-transformer'

//String that allows to identificate field types for testing
const DESCRIPTION_STR = "$$_testing_$$"

const validationMatchObject = {
    id: expect.any(String),
    name: expect.any(String),
    description: expect.any(String),
    action: expect.any(String),
    error_message: expect.any(String)
}

const getRandomType = () => {
    return {
        name: `t_${Math.round(Math.random() * 999999999)}`,
        description: `d_${Math.round(Math.random() * 999999999)}`,
        component: `c_${Math.round(Math.random() * 999999999)}`,
    }
}

const getRandomValidations = async (runner: QueryRunner, count: number): Promise<Validation[]> => {
    let result = []

    let validations = await runner.manager.find(Validation)

    while (count-- > 0) {
        let i = Math.floor(Math.random() * validations.length)
        result.push(validations[i])
        validations.splice(i, 1)
    }

    return result
}

export let addFieldTypesWithRelations = async (suite: Suite) => {
    // Add some new types with related validations
    let types = []

    for (let i = 10; i > 0; i--) {
        let t: any = getRandomType()
        t.description = DESCRIPTION_STR
        t.validations = []
        //Adding 5 validations as a relation
        t.validations = await getRandomValidations(suite.runner, 5)
        types.push(t)
    }

    await suite.runner.manager.save(suite.runner.manager.create(FieldType, types))
}


export let NoUserGetAllFieldType = async (suite: Suite) => {
    return await request(suite.app.getHttpServer())
        .get('/api/field_types/')
        .expect(HttpStatus.FORBIDDEN)
}

export let NoUserGetOneFieldType = async (suite: Suite) => {
    let uuid = uuidv4()
    return await request(suite.app.getHttpServer())
        .get(`/api/field_types/${uuid}`)
        .expect(HttpStatus.FORBIDDEN)
}

export let NoUserCreateFieldType = async (suite: Suite) => {
    return await request(suite.app.getHttpServer())
        .post(`/api/field_types/`)
        .expect(HttpStatus.FORBIDDEN)
}

export let NoUserUpdateFieldType = async (suite: Suite) => {
    let uuid = uuidv4()
    return await request(suite.app.getHttpServer())
        .patch(`/api/field_types/${uuid}`)
        .expect(HttpStatus.FORBIDDEN)
}

export let NoUserDeleteFieldType = async (suite: Suite) => {
    let uuid = uuidv4()
    return await request(suite.app.getHttpServer())
        .delete(`/api/field_types/${uuid}`)
        .expect(HttpStatus.FORBIDDEN)
}

export let AllFieldTypes = async (suite: Suite) => {
    let token = await getValiduserToken(suite)

    let count = await suite.runner.query('SELECT COUNT(*) from field_types')
    count = parseInt(count[0].count)
    return await request(suite.app.getHttpServer())
        .get(`/api/field_types/`)
        .set({ 'Authorization': `Bearer ${token}` })
        .expect(HttpStatus.OK)
        .expect(res => expect(res.body).toMatchObject({ items: expect.anything() }))
        .expect(res => expect(Array.isArray(res.body.items)).toBe(true))
        .expect(res => expect(res.body.items).toHaveLength(count))
}

export let AllEmptyFieldTypes = async (suite: Suite) => {
    let token = await getValiduserToken(suite)
    // Backing up the data (so we can return an empty array and continue other tests)
    await suite.runner.query('ALTER TABLE "field_types" RENAME TO "field_types_backup"')
    await suite.runner.query(`CREATE TABLE "field_types" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "description" character varying NOT NULL DEFAULT '', "component" character varying NOT NULL, "parameters" jsonb NOT NULL DEFAULT '{}', CONSTRAINT "PK_field_test" PRIMARY KEY ("id"))`, undefined);

    await request(suite.app.getHttpServer())
        .get(`/api/field_types/`)
        .set({ 'Authorization': `Bearer ${token}` })
        .expect(HttpStatus.OK)
        .expect(res => expect(res.body).toMatchObject({ items: expect.anything() }))
        .expect(res => expect(Array.isArray(res.body.items)).toBe(true))
        .expect(res => expect(res.body.items).toHaveLength(0))

    // Recovering the previous data
    await suite.runner.query(`DROP TABLE "field_types"`, undefined);
    await suite.runner.query(`ALTER TABLE "field_types_backup" RENAME TO "field_types"`)
}

export let GetOneFieldType = async (suite: Suite) => {
    let token = await getValiduserToken(suite)

    // Pick a random one to be rerieved by the API
    let items = await suite.runner.manager.find(FieldType)
    let item = items[Math.floor((Math.random() * items.length))]

    await request(suite.app.getHttpServer())
        .get(`/api/field_types/${item.id}`)
        .set({ 'Authorization': `Bearer ${token}` })
        .expect(HttpStatus.OK)
        .expect(res => expect(res.body).toEqual(item))
}

export let FieldTypeWrongID = async (suite: Suite) => {
    let token = await getValiduserToken(suite)
    let id = uuidv4()
    await request(suite.app.getHttpServer())
        .get(`/api/field_types/${id}`)
        .set({ 'Authorization': `Bearer ${token}` })
        .expect(HttpStatus.NOT_FOUND)
}

export let FieldTypeMalformedUUID = async (suite: Suite) => {
    let token = await getValiduserToken(suite)
    let id = 'wrong'
    await request(suite.app.getHttpServer())
        .get(`/api/field_types/${id}`)
        .set({ 'Authorization': `Bearer ${token}` })
        .expect(HttpStatus.UNPROCESSABLE_ENTITY)
}

export let UpdateFieldTypeWrongID = async (suite: Suite) => {
    let token = await getValiduserToken(suite)
    let id = uuidv4()
    await request(suite.app.getHttpServer())
        .patch(`/api/field_types/${id}`)
        .set({ 'Authorization': `Bearer ${token}` })
        .expect(HttpStatus.NOT_FOUND)
}

export let UpdateFieldTypeMalformedUUID = async (suite: Suite) => {
    let token = await getValiduserToken(suite)
    let id = 'wrong'
    await request(suite.app.getHttpServer())
        .patch(`/api/field_types/${id}`)
        .set({ 'Authorization': `Bearer ${token}` })
        .expect(HttpStatus.UNPROCESSABLE_ENTITY)
}

export let UpdateFieldTypeDuplicatedName = async (suite: Suite) => {
    let token = await getValiduserToken(suite)
    let items = await suite.runner.manager.find(FieldType)
    let toUpdate = { name: items[1].name }
    let id = items[0].id

    await request(suite.app.getHttpServer())
        .patch(`/api/field_types/${id}`)
        .set({ 'Authorization': `Bearer ${token}` })
        .send(toUpdate)
        .expect(HttpStatus.CONFLICT)
}

export let UpdateFieldType = async (suite: Suite) => {
    let token = await getValiduserToken(suite)
    let item: any = getRandomType()

    await request(suite.app.getHttpServer())
        .post(`/api/field_types/`)
        .set({ 'Authorization': `Bearer ${token}` })
        .send(item)
        .expect(HttpStatus.CREATED)
        .expect(res => item = res.body)

    let change = getRandomType()
    await request(suite.app.getHttpServer())
        .patch(`/api/field_types/${item.id}`)
        .set({ 'Authorization': `Bearer ${token}` })
        .send(change)
        .expect(HttpStatus.OK)
        .expect(res => expect(res.body).toMatchObject(change))
}

export let CreateIncompleteFieldType = async (suite: Suite) => {
    let token = await getValiduserToken(suite)
    let item = getRandomType()

    // Without name
    delete item.name
    await request(suite.app.getHttpServer())
        .post(`/api/field_types/`)
        .set({ 'Authorization': `Bearer ${token}` })
        .send(item)
        .expect(HttpStatus.UNPROCESSABLE_ENTITY)

    // Without component
    item = getRandomType()
    delete item.component
    await request(suite.app.getHttpServer())
        .post(`/api/field_types/`)
        .set({ 'Authorization': `Bearer ${token}` })
        .send(item)
        .expect(HttpStatus.UNPROCESSABLE_ENTITY)
}

export let CreateFieldType = async (suite: Suite) => {
    let token = await getValiduserToken(suite)
    let item: any = getRandomType()

    await request(suite.app.getHttpServer())
        .post(`/api/field_types/`)
        .set({ 'Authorization': `Bearer ${token}` })
        .send(item)
        .expect(HttpStatus.CREATED)
        .expect(res => expect(res.body).toMatchObject(item))
}

export let CreateDuplicatedFieldType = async (suite: Suite) => {
    let token = await getValiduserToken(suite)
    let item = getRandomType()

    await request(suite.app.getHttpServer())
        .post(`/api/field_types/`)
        .set({ 'Authorization': `Bearer ${token}` })
        .send(item)
        .expect(HttpStatus.CREATED)

    await request(suite.app.getHttpServer())
        .post(`/api/field_types/`)
        .set({ 'Authorization': `Bearer ${token}` })
        .send(item)
        .expect(HttpStatus.CONFLICT)
}

export let DeleteFieldTypeWrongID = async (suite: Suite) => {
    let token = await getValiduserToken(suite)

    let id = uuidv4()

    await request(suite.app.getHttpServer())
        .delete(`/api/field_types/${id}`)
        .set({ 'Authorization': `Bearer ${token}` })
        .expect(HttpStatus.NOT_FOUND)
}

export let DeleteFieldTypeMalformedUUID = async (suite: Suite) => {
    let token = await getValiduserToken(suite)

    let id = 'wrong'
    await request(suite.app.getHttpServer())
        .delete(`/api/field_types/${id}`)
        .set({ 'Authorization': `Bearer ${token}` })
        .expect(HttpStatus.UNPROCESSABLE_ENTITY)
}

export let DeleteFieldType = async (suite: Suite) => {
    let token = await getValiduserToken(suite)
    let items = await suite.runner.manager.find(FieldType, { description: DESCRIPTION_STR })
    let item = items[Math.floor((Math.random() * items.length))]

    await request(suite.app.getHttpServer())
        .delete(`/api/field_types/${item.id}`)
        .set({ 'Authorization': `Bearer ${token}` })
        .expect(HttpStatus.OK)

    await request(suite.app.getHttpServer())
        .get(`/api/field_types/${item.id}`)
        .set({ 'Authorization': `Bearer ${token}` })
        .expect(HttpStatus.NOT_FOUND)
}

export let GetAllFieldTypesWithValidations = async (suite: Suite) => {
    let token = await getValiduserToken(suite)
    let items: FieldType[] = []

    await request(suite.app.getHttpServer())
        .get(`/api/field_types/`)
        .set({ 'Authorization': `Bearer ${token}` })
        .expect(HttpStatus.OK)
        .expect(res => expect(res.body).toMatchObject({ items: expect.anything() }))
        .expect(res => expect(Array.isArray(res.body.items)).toBe(true))
        .expect(res => expect(Array.isArray(res.body.items)).toBe(true))
        .then(res => {
            res.body.items.forEach(f => {
                items.push(plainToClass(FieldType, f))
            })
        })
    for (let i = 0; i < items.length; i++) {
        let item = items[i]

        // Check the correct amount of validations
        let count = await suite.runner.query('SELECT COUNT(*) FROM field_types_validations WHERE field_type_id=$1', [item.id])
        count = parseInt(count[0].count)

        expect(item.validations).toHaveLength(count)

        // Each validation should be a full object
        for (let j = 0; j < item.validations.length; j++) {
            expect(item.validations[j]).toMatchObject(validationMatchObject)
        }
    }
}

export let GetOneFieldTypeincludingValidations = async (suite: Suite) => {
    let token = await getValiduserToken(suite)

    // Pick a random one to be rerieved by the API
    let items = await suite.runner.manager.find(FieldType, { description: DESCRIPTION_STR })
    let item = items[Math.floor((Math.random() * items.length))]

    await request(suite.app.getHttpServer())
        .get(`/api/field_types/${item.id}`)
        .set({ 'Authorization': `Bearer ${token}` })
        .expect(HttpStatus.OK)
        .expect(res => expect(res.body).toEqual(item))
        .expect(res => expect(res.body).toMatchObject({ validations: expect.any(Array) }))
        .expect(async res => {
            let count = await suite.runner.query('SELECT COUNT(*) FROM field_types_validations WHERE field_type_id=$1', [res.body.id])
            count = parseInt(count[0].count)
            expect(res.body.validations).toHaveLength(count)

            for (let i = 0; i < res.body.validations.length; i++) {
                expect(res.body.validations[i]).toMatchObject(validationMatchObject)
            }
        })
}


export let UpdateFieldTypeWithValidations = async (suite: Suite) => {
    let token = await getValiduserToken(suite)
    let item: any = getRandomType()

    item.validations = await getRandomValidations(suite.runner, 4)
    let validation = item.validations.splice(0, 1)[0]
    item = await suite.runner.manager.save(suite.runner.manager.create(FieldType, item))

    // For the update we will send only the names
    let validations: string[] = item.validations.map(item => {
        return item.name
    })

    validations.push(validation.name)

    await request(suite.app.getHttpServer())
        .patch(`/api/field_types/${item.id}`)
        .set({ 'Authorization': `Bearer ${token}` })
        .send({ validations: validations })
        .expect(HttpStatus.OK)
        .expect(res => expect(res.body).toMatchObject({ validations: expect.any(Array) }))
        .expect(res => {
            expect(res.body.validations).toHaveLength(validations.length)

            for (let i = 0; i < res.body.validations.length; i++) {
                expect(res.body.validations[i]).toMatchObject(validationMatchObject)
            }
        })
}

export let UpdatingFieldTypeNoValidationsOverwrite = async (suite: Suite) => {
    let token = await getValiduserToken(suite)
    let item: any = getRandomType()

    let validationCount = 4
    item.validations = await getRandomValidations(suite.runner, 4)
    item = await suite.runner.manager.save(suite.runner.manager.create(FieldType, item))

    // No overwrite
    await request(suite.app.getHttpServer())
        .patch(`/api/field_types/${item.id}`)
        .set({ 'Authorization': `Bearer ${token}` })
        .send({ name: 'validations' })
        .expect(HttpStatus.OK)
        .expect(res => expect(res.body).toMatchObject({ validations: expect.any(Array) }))
        .expect(res => expect(res.body.validations).toHaveLength(validationCount))

    // Overwrite
    await request(suite.app.getHttpServer())
        .patch(`/api/field_types/${item.id}`)
        .set({ 'Authorization': `Bearer ${token}` })
        .send({ validations: [] })
        .expect(HttpStatus.OK)
        .expect(res => expect(res.body).toMatchObject({ validations: expect.any(Array) }))
        .expect(res => expect(res.body.validations).toHaveLength(0))
}

export let CreateWithValidations = async (suite: Suite) => {
    let token = await getValiduserToken(suite)
    let item: any = getRandomType()
    let validationsCount = 6
    let validations = await getRandomValidations(suite.runner, validationsCount)
    let toSend;

    // By name
    toSend = validations.filter((v, index) => index < (validationsCount >> 1)).map(v => v.name)
    // By id
    toSend = toSend.concat(validations.filter((v, index) => index >= (validationsCount >> 1)).map(v => v.id))

    item.validations = toSend;

    // Creation
    await request(suite.app.getHttpServer())
        .post(`/api/field_types/`)
        .set({ 'Authorization': `Bearer ${token}` })
        .send(item)
        .expect(HttpStatus.CREATED)
        .expect(res => expect(res.body.validations).toHaveLength(validationsCount))
        .expect(res => {
            for (let i = 0; i < res.body.validations.length; i++) {
                expect(res.body.validations[i]).toMatchObject(validationMatchObject)
            }
        })

}

export let CreateWithNoDuplicatedValidations = async (suite: Suite) => {
    let token = await getValiduserToken(suite)
    let item: any = getRandomType()
    let validationsCount = 6

    item.validations = await getRandomValidations(suite.runner, validationsCount)
    item.validations = item.validations.concat(item.validations)
    item.validations = item.validations.map(v => v.id)

    // Creation
    await request(suite.app.getHttpServer())
        .post(`/api/field_types/`)
        .set({ 'Authorization': `Bearer ${token}` })
        .send(item)
        .expect(HttpStatus.CREATED)
        .expect(res => expect(res.body.validations).toHaveLength(validationsCount))
}

export let UpdateWithNoDuplicatedValidations = async (suite: Suite) => {
    let token = await getValiduserToken(suite)
    let item: any = getRandomType()
    let validationsCount = 6
    let validations: any[] = await getRandomValidations(suite.runner, validationsCount)

    validations = validations.concat(validations)
    validations = validations.map(v => v.id)

    //inserting type
    item = await suite.runner.manager.save(suite.runner.manager.create(FieldType, item))

    // update
    await request(suite.app.getHttpServer())
        .patch(`/api/field_types/${item.id}`)
        .set({ 'Authorization': `Bearer ${token}` })
        .send({ validations: validations })
        .expect(HttpStatus.OK)
        .expect(res => expect(res.body.validations).toHaveLength(validationsCount))
}

export let UpdateWithValidationsNameOrID = async (suite: Suite) => {
    let token = await getValiduserToken(suite)
    let item: any = getRandomType()
    let validationsCount = 6
    let validations: any[] = await getRandomValidations(suite.runner, validationsCount)
    let toSend: any[]

    // By name
    toSend = validations.filter((v, index) => index < (validationsCount >> 1)).map(v => v.name)
    // By id
    toSend = toSend.concat(validations.filter((v, index) => index >= (validationsCount >> 1)).map(v => v.id))

    //inserting type
    item = await suite.runner.manager.save(suite.runner.manager.create(FieldType, item))

    // update
    await request(suite.app.getHttpServer())
        .patch(`/api/field_types/${item.id}`)
        .set({ 'Authorization': `Bearer ${token}` })
        .send({ validations: toSend })
        .expect(HttpStatus.OK)
        .expect(res => expect(res.body.validations).toHaveLength(validationsCount))
}

export let UpdateToRemoveValidations = async (suite: Suite) => {
    let token = await getValiduserToken(suite)
    let item: any = getRandomType()
    let validationsCount = 6
    item.validations = await getRandomValidations(suite.runner, validationsCount)

    //inserting type
    item = await suite.runner.manager.save(suite.runner.manager.create(FieldType, item))

    // reality check
    await request(suite.app.getHttpServer())
        .get(`/api/field_types/${item.id}`)
        .set({ 'Authorization': `Bearer ${token}` })
        .expect(HttpStatus.OK)
        .expect(res => expect(res.body.validations).toHaveLength(validationsCount))

    // update with empty validations
    await request(suite.app.getHttpServer())
        .patch(`/api/field_types/${item.id}`)
        .set({ 'Authorization': `Bearer ${token}` })
        .send({ validations: [] })
        .expect(HttpStatus.OK)
        .expect(res => expect(res.body.validations).toHaveLength(0))
}

export let UpdatewithNonExistingValidations = async (suite: Suite) => {
    let token = await getValiduserToken(suite)
    let item: any = getRandomType()

    //inserting type
    item = await suite.runner.manager.save(suite.runner.manager.create(FieldType, item))

    // update 
    await request(suite.app.getHttpServer())
        .patch(`/api/field_types/${item.id}`)
        .set({ 'Authorization': `Bearer ${token}` })
        .send({ validations: ['fake', 'fake2', 'fake3'] })
        .expect(HttpStatus.OK)
        .expect(res => expect(res.body.validations).toHaveLength(0))
        .expect(async res => {
            let count = await suite.runner.query('SELECT COUNT(*) FROM field_types_validations WHERE field_type_id=$1', [res.body.id])
            count = parseInt(count[0].count)
            expect(count).toBe(0)
        })
}

export let CreateWithNonExistingValidations = async (suite: Suite) => {
    let token = await getValiduserToken(suite)
    let item: any = getRandomType()
    item.validations = ['fake', 'fake2', 'fake3']

    await request(suite.app.getHttpServer())
        .post(`/api/field_types/`)
        .set({ 'Authorization': `Bearer ${token}` })
        .send(item)
        .expect(HttpStatus.CREATED)
        .expect(res => expect(res.body.validations).toHaveLength(0))
        .expect(async res => {
            let count = await suite.runner.query('SELECT COUNT(*) FROM field_types_validations WHERE field_type_id=$1', [res.body.id])
            count = parseInt(count[0].count)
            expect(count).toBe(0)
        })
}

export let NoOrphanValidations = async (suite: Suite) => {
    let token = await getValiduserToken(suite)
    let item: any = getRandomType()
    let validationsCount = 3
    item.validations = await getRandomValidations(suite.runner, validationsCount)

    //inserting type
    item = await suite.runner.manager.save(suite.runner.manager.create(FieldType, item))

    let count = await suite.runner.query('SELECT COUNT(*) FROM field_types_validations WHERE field_type_id=$1', [item.id])
    count = parseInt(count[0].count)
    expect(count).toBe(validationsCount)

    await request(suite.app.getHttpServer())
        .delete(`/api/field_types/${item.id}`)
        .set({ 'Authorization': `Bearer ${token}` })
        .expect(HttpStatus.OK)
        .expect(async res => {
            let count = await suite.runner.query('SELECT COUNT(*) FROM field_types_validations WHERE field_type_id=$1', [item.id])
            count = parseInt(count[0].count)
            expect(count).toBe(0)
        })
}