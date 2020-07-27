import * as request from 'supertest'
import { QueryRunner } from 'typeorm'
import { Suite, getValiduserToken } from './test-utils'
import { HttpStatus } from '@nestjs/common'
import * as uuidv4 from 'uuid/v4'
import { FieldType } from 'src/field_types/field_type.entity'
import { plainToClass } from 'class-transformer'
import { Transformation } from 'src/transformations/transformation.entity'

//String that allows to identificate entities for testing
const DESCRIPTION_STR = "$$_testing_$$"

const main_route = 'transformations'
const main_table = 'transformations'
const main_table_relation = 'transformations_field_types'
const relation_id = 'transformation_id'

const FieldTypeMatchObject = {
    id: expect.any(String),
    name: expect.any(String),
    description: expect.any(String),
    component: expect.any(String)
}

const getRandomTransformation = () => {
    return {
        name: `t_${Math.round(Math.random() * 999999999)}`,
        description: `d_${Math.round(Math.random() * 999999999)}`,
    }
}

const getRandomFieldTypes = async (runner: QueryRunner, count: number): Promise<FieldType[]> => {
    let result = []

    let items = await runner.manager.find(FieldType)

    while (count-- > 0) {
        let i = Math.floor(Math.random() * items.length)
        result.push(items[i])
        items.splice(i, 1)
    }

    return result
}

export let addTransformationsWithRelations = async (suite: Suite) => {
    // Add some new transformations with related field types
    let items = []

    for (let i = 10; i > 0; i--) {
        let t: any = getRandomTransformation()
        t.description = DESCRIPTION_STR
        t.supported_types = []
        //Adding relations
        t.supported_types = await getRandomFieldTypes(suite.runner, 5)
        items.push(t)
    }

    await suite.runner.manager.save(suite.runner.manager.create(Transformation, items))
}


export let T_NoUserGetAll = async (suite: Suite) => {
    return await request(suite.app.getHttpServer())
        .get(`/api/${main_route}/`)
        .expect(HttpStatus.FORBIDDEN)
}

export let T_NoUserGetOne = async (suite: Suite) => {
    let uuid = uuidv4()
    return await request(suite.app.getHttpServer())
        .get(`/api/${main_route}/${uuid}`)
        .expect(HttpStatus.FORBIDDEN)
}

export let T_NoUserCreate = async (suite: Suite) => {
    return await request(suite.app.getHttpServer())
        .post(`/api/${main_route}/`)
        .expect(HttpStatus.FORBIDDEN)
}

export let T_NoUserUpdate = async (suite: Suite) => {
    let uuid = uuidv4()
    return await request(suite.app.getHttpServer())
        .patch(`/api/${main_route}/${uuid}`)
        .expect(HttpStatus.FORBIDDEN)
}

export let T_NoUserDelete = async (suite: Suite) => {
    let uuid = uuidv4()
    return await request(suite.app.getHttpServer())
        .delete(`/api/${main_route}/${uuid}`)
        .expect(HttpStatus.FORBIDDEN)
}

export let T_GetAll = async (suite: Suite) => {
    let token = await getValiduserToken(suite)

    let count = await suite.runner.query(`SELECT COUNT(*) from ${main_table}`)
    count = parseInt(count[0].count)
    return await request(suite.app.getHttpServer())
        .get(`/api/${main_route}/`)
        .set({ 'Authorization': `Bearer ${token}` })
        .expect(HttpStatus.OK)
        .expect(res => expect(res.body).toMatchObject({ items: expect.any(Array) }))
        .expect(res => expect(res.body.items).toHaveLength(count))
}

export let T_GetAllEmpty = async (suite: Suite) => {
    let token = await getValiduserToken(suite)
    // Backing up the data (so we can return an empty array and continue other tests)
    await suite.runner.query(`ALTER TABLE "${main_table}" RENAME TO "${main_table}_backup"`)
    await suite.runner.query(`CREATE TABLE "${main_table}" AS TABLE "${main_table}_backup" WITH NO DATA;`)

    await request(suite.app.getHttpServer())
        .get(`/api/${main_route}/`)
        .set({ 'Authorization': `Bearer ${token}` })
        .expect(HttpStatus.OK)
        .expect(res => expect(res.body).toMatchObject({ items: expect.any(Array) }))
        .expect(res => expect(res.body.items).toHaveLength(0))

    // Recovering the previous data
    await suite.runner.query(`DROP TABLE "${main_table}"`, undefined);
    await suite.runner.query(`ALTER TABLE "${main_table}_backup" RENAME TO "${main_table}"`)
}

export let T_GetOne = async (suite: Suite) => {
    let token = await getValiduserToken(suite)

    // Pick a random one to be rerieved by the API
    // let items = await suite.runner.manager.find(Transformation)
    let items = await suite.runner.manager.createQueryBuilder(Transformation, 'ts')
        .leftJoinAndSelect("ts.supported_types", "types")
        .getMany()
    let item = items[Math.floor((Math.random() * items.length))]

    await request(suite.app.getHttpServer())
        .get(`/api/${main_route}/${item.id}`)
        .set({ 'Authorization': `Bearer ${token}` })
        .expect(HttpStatus.OK)
        .expect(res => expect(res.body).toEqual(item))
}

export let T_GetOneWrongID = async (suite: Suite) => {
    let token = await getValiduserToken(suite)
    let id = uuidv4()
    await request(suite.app.getHttpServer())
        .get(`/api/${main_route}/${id}`)
        .set({ 'Authorization': `Bearer ${token}` })
        .expect(HttpStatus.NOT_FOUND)
}

export let T_GetOneMalformedUUID = async (suite: Suite) => {
    let token = await getValiduserToken(suite)
    let id = 'wrong'
    await request(suite.app.getHttpServer())
        .get(`/api/${main_route}/${id}`)
        .set({ 'Authorization': `Bearer ${token}` })
        .expect(HttpStatus.UNPROCESSABLE_ENTITY)
}

export let T_UpdateWrongID = async (suite: Suite) => {
    let token = await getValiduserToken(suite)
    let id = uuidv4()
    await request(suite.app.getHttpServer())
        .patch(`/api/${main_route}/${id}`)
        .set({ 'Authorization': `Bearer ${token}` })
        .expect(HttpStatus.NOT_FOUND)
}

export let T_UpdateMalformedUUID = async (suite: Suite) => {
    let token = await getValiduserToken(suite)
    let id = 'wrong'
    await request(suite.app.getHttpServer())
        .patch(`/api/${main_route}/${id}`)
        .set({ 'Authorization': `Bearer ${token}` })
        .expect(HttpStatus.UNPROCESSABLE_ENTITY)
}

export let T_UpdateDuplicatedName = async (suite: Suite) => {
    let token = await getValiduserToken(suite)
    let items = await suite.runner.manager.find(Transformation)
    let toUpdate = { name: items[1].name }
    let id = items[0].id

    await request(suite.app.getHttpServer())
        .patch(`/api/${main_route}/${id}`)
        .set({ 'Authorization': `Bearer ${token}` })
        .send(toUpdate)
        .expect(HttpStatus.CONFLICT)
}

export let T_Update = async (suite: Suite) => {
    let token = await getValiduserToken(suite)
    let item: any = getRandomTransformation()

    // Insert
    item = await suite.runner.manager.save(suite.runner.manager.create(Transformation, item))

    // Update with new info
    let change = getRandomTransformation()
    await request(suite.app.getHttpServer())
        .patch(`/api/${main_route}/${item.id}`)
        .set({ 'Authorization': `Bearer ${token}` })
        .send(change)
        .expect(HttpStatus.OK)
        .expect(res => expect(res.body).toMatchObject(change))
}

export let T_CreateIncomplete = async (suite: Suite) => {
    let token = await getValiduserToken(suite)
    let item = getRandomTransformation()

    // Without name
    delete item.name
    await request(suite.app.getHttpServer())
        .post(`/api/${main_route}/`)
        .set({ 'Authorization': `Bearer ${token}` })
        .send(item)
        .expect(HttpStatus.UNPROCESSABLE_ENTITY)
}

export let T_Create = async (suite: Suite) => {
    let token = await getValiduserToken(suite)
    let item: any = getRandomTransformation()

    await request(suite.app.getHttpServer())
        .post(`/api/${main_route}/`)
        .set({ 'Authorization': `Bearer ${token}` })
        .send(item)
        .expect(HttpStatus.CREATED)
        .expect(res => expect(res.body).toMatchObject(item))
}

export let T_CreateDuplicated = async (suite: Suite) => {
    let token = await getValiduserToken(suite)
    let item = getRandomTransformation()

    // Insert
    await suite.runner.manager.save(suite.runner.manager.create(Transformation, item))

    await request(suite.app.getHttpServer())
        .post(`/api/${main_route}/`)
        .set({ 'Authorization': `Bearer ${token}` })
        .send(item)
        .expect(HttpStatus.CONFLICT)
}

export let T_DeleteWrongID = async (suite: Suite) => {
    let token = await getValiduserToken(suite)
    let id = uuidv4()

    await request(suite.app.getHttpServer())
        .delete(`/api/${main_route}/${id}`)
        .set({ 'Authorization': `Bearer ${token}` })
        .expect(HttpStatus.NOT_FOUND)
}

export let T_DeleteMalformedUUID = async (suite: Suite) => {
    let token = await getValiduserToken(suite)
    let id = 'wrong'
    await request(suite.app.getHttpServer())
        .delete(`/api/${main_route}/${id}`)
        .set({ 'Authorization': `Bearer ${token}` })
        .expect(HttpStatus.UNPROCESSABLE_ENTITY)
}

export let T_Delete = async (suite: Suite) => {
    let token = await getValiduserToken(suite)
    let items = await suite.runner.manager.find(Transformation, { description: DESCRIPTION_STR })
    let item = items[Math.floor((Math.random() * items.length))]

    await request(suite.app.getHttpServer())
        .delete(`/api/${main_route}/${item.id}`)
        .set({ 'Authorization': `Bearer ${token}` })
        .expect(HttpStatus.OK)

    await request(suite.app.getHttpServer())
        .get(`/api/${main_route}/${item.id}`)
        .set({ 'Authorization': `Bearer ${token}` })
        .expect(HttpStatus.NOT_FOUND)
}

export let T_GetAllWithRelations = async (suite: Suite) => {
    let token = await getValiduserToken(suite)
    let items: Transformation[] = []

    await request(suite.app.getHttpServer())
        .get(`/api/${main_route}/`)
        .set({ 'Authorization': `Bearer ${token}` })
        .expect(HttpStatus.OK)
        .expect(res => expect(res.body).toMatchObject({ items: expect.any(Array) }))
        .then(res => {
            res.body.items.forEach(f => {
                items.push(plainToClass(Transformation, f))
            })
        })
    for (let i = 0; i < items.length; i++) {
        let item = items[i]

        // Check the correct amount of relations
        let count = await suite.runner.query(`SELECT COUNT(*) FROM ${main_table_relation} WHERE ${relation_id}=$1`, [item.id])
        count = parseInt(count[0].count)

        expect(item.supported_types).toHaveLength(count)

        // Each relation should be a full object
        for (let j = 0; j < item.supported_types.length; j++) {
            expect(item.supported_types[j]).toMatchObject(FieldTypeMatchObject)
        }
    }
}

export let T_GetOneWithRelations = async (suite: Suite) => {
    let token = await getValiduserToken(suite)

    // Pick a random one to be retrieved by the API
    // let items = await suite.runner.manager.find(Transformation, { description: DESCRIPTION_STR })
    let items = await suite.runner.manager.createQueryBuilder(Transformation, 'ts')
        .where("ts.description = :desc", { desc: DESCRIPTION_STR })
        .leftJoinAndSelect("ts.supported_types", "types")
        .getMany()

    let item = items[Math.floor((Math.random() * items.length))]

    await request(suite.app.getHttpServer())
        .get(`/api/${main_route}/${item.id}`)
        .set({ 'Authorization': `Bearer ${token}` })
        .expect(HttpStatus.OK)
        .expect(res => expect(res.body).toEqual(item))
        .expect(res => expect(res.body).toMatchObject({ supported_types: expect.any(Array) }))
        .expect(async res => {
            let count = await suite.runner.query(`SELECT COUNT(*) FROM ${main_table_relation} WHERE ${relation_id}=$1`, [res.body.id])
            count = parseInt(count[0].count)
            expect(res.body.supported_types).toHaveLength(count)

            for (let i = 0; i < res.body.supported_types.length; i++) {
                expect(res.body.supported_types[i]).toMatchObject(FieldTypeMatchObject)
            }
        })
}


export let T_UpdateWithRelations = async (suite: Suite) => {
    let token = await getValiduserToken(suite)
    let item: any = getRandomTransformation()

    item.supported_types = await getRandomFieldTypes(suite.runner, 4)
    let type = item.supported_types.splice(0, 1)[0]
    item = await suite.runner.manager.save(suite.runner.manager.create(Transformation, item))

    // For the update we will send only the names
    let supported_types: string[] = item.supported_types.map(item => item.name)

    supported_types.push(type.name)

    await request(suite.app.getHttpServer())
        .patch(`/api/${main_route}/${item.id}`)
        .set({ 'Authorization': `Bearer ${token}` })
        .send({ supported_types: supported_types })
        .expect(HttpStatus.OK)
        .expect(res => expect(res.body).toMatchObject({ supported_types: expect.any(Array) }))
        .expect(res => {
            expect(res.body.supported_types).toHaveLength(supported_types.length)

            for (let i = 0; i < res.body.supported_types.length; i++) {
                expect(res.body.supported_types[i]).toMatchObject(FieldTypeMatchObject)
            }
        })
}

export let T_UpdateNoRelationsOverwrite = async (suite: Suite) => {
    let token = await getValiduserToken(suite)
    let item: any = getRandomTransformation()

    let itemsCount = 4
    item.supported_types = await getRandomFieldTypes(suite.runner, 4)
    item = await suite.runner.manager.save(suite.runner.manager.create(Transformation, item))

    // No overwrite
    await request(suite.app.getHttpServer())
        .patch(`/api/${main_route}/${item.id}`)
        .set({ 'Authorization': `Bearer ${token}` })
        .send({ name: 'test_name' })
        .expect(HttpStatus.OK)
        .expect(res => expect(res.body).toMatchObject({ supported_types: expect.any(Array) }))
        .expect(res => expect(res.body.supported_types).toHaveLength(itemsCount))

    // Overwrite
    await request(suite.app.getHttpServer())
        .patch(`/api/${main_route}/${item.id}`)
        .set({ 'Authorization': `Bearer ${token}` })
        .send({ supported_types: [] })
        .expect(HttpStatus.OK)
        .expect(res => expect(res.body).toMatchObject({ supported_types: expect.any(Array) }))
        .expect(res => expect(res.body.supported_types).toHaveLength(0))
}

export let T_CreateWithRelations = async (suite: Suite) => {
    let token = await getValiduserToken(suite)
    let item: any = getRandomTransformation()
    let itemsCount = 6
    let supported_types = await getRandomFieldTypes(suite.runner, itemsCount)
    let toSend;

    // By name
    toSend = supported_types.filter((v, index) => index < (itemsCount >> 1)).map(v => v.name)
    // By id
    toSend = toSend.concat(supported_types.filter((v, index) => index >= (itemsCount >> 1)).map(v => v.id))

    item.supported_types = toSend;

    // Creation
    await request(suite.app.getHttpServer())
        .post(`/api/${main_route}/`)
        .set({ 'Authorization': `Bearer ${token}` })
        .send(item)
        .expect(HttpStatus.CREATED)
        .expect(res => expect(res.body.supported_types).toHaveLength(itemsCount))
        .expect(res => {
            for (let i = 0; i < res.body.supported_types.length; i++) {
                expect(res.body.supported_types[i]).toMatchObject(FieldTypeMatchObject)
            }
        })

}

export let T_CreateWithNoDuplicatedRelations = async (suite: Suite) => {
    let token = await getValiduserToken(suite)
    let item: any = getRandomTransformation()
    let itemsCount = 6

    item.supported_types = await getRandomFieldTypes(suite.runner, itemsCount)
    item.supported_types = item.supported_types.concat(item.supported_types)
    item.supported_types = item.supported_types.map(v => v.id)

    // Creation
    await request(suite.app.getHttpServer())
        .post(`/api/${main_route}/`)
        .set({ 'Authorization': `Bearer ${token}` })
        .send(item)
        .expect(HttpStatus.CREATED)
        .expect(res => expect(res.body.supported_types).toHaveLength(itemsCount))
}

export let T_UpdateWithNoDuplicatedRelations = async (suite: Suite) => {
    let token = await getValiduserToken(suite)
    let item: any = getRandomTransformation()
    let itemsCount = 6
    let supported_types: any[] = await getRandomFieldTypes(suite.runner, itemsCount)

    supported_types = supported_types.concat(supported_types).map(v => v.id)

    //inserting type
    item = await suite.runner.manager.save(suite.runner.manager.create(Transformation, item))

    // update
    await request(suite.app.getHttpServer())
        .patch(`/api/${main_route}/${item.id}`)
        .set({ 'Authorization': `Bearer ${token}` })
        .send({ supported_types: supported_types })
        .expect(HttpStatus.OK)
        .expect(res => expect(res.body.supported_types).toHaveLength(itemsCount))
}

export let T_UpdateWithRelationsNameOrID = async (suite: Suite) => {
    let token = await getValiduserToken(suite)
    let item: any = getRandomTransformation()
    let itemsCount = 6
    let supported_types: any[] = await getRandomFieldTypes(suite.runner, itemsCount)
    let toSend: any[]

    // By name
    toSend = supported_types.filter((v, index) => index < (itemsCount >> 1)).map(v => v.name)
    // By id
    toSend = toSend.concat(supported_types.filter((v, index) => index >= (itemsCount >> 1)).map(v => v.id))

    //inserting item
    item = await suite.runner.manager.save(suite.runner.manager.create(Transformation, item))

    // update
    await request(suite.app.getHttpServer())
        .patch(`/api/${main_route}/${item.id}`)
        .set({ 'Authorization': `Bearer ${token}` })
        .send({ supported_types: toSend })
        .expect(HttpStatus.OK)
        .expect(res => expect(res.body.supported_types).toHaveLength(itemsCount))
}

export let T_UpdateToRemoveRelations = async (suite: Suite) => {
    let token = await getValiduserToken(suite)
    let item: any = getRandomTransformation()
    let itemsCount = 6
    item.supported_types = await getRandomFieldTypes(suite.runner, itemsCount)

    //inserting type
    item = await suite.runner.manager.save(suite.runner.manager.create(Transformation, item))

    // reality check
    await request(suite.app.getHttpServer())
        .get(`/api/${main_route}/${item.id}`)
        .set({ 'Authorization': `Bearer ${token}` })
        .expect(HttpStatus.OK)
        .expect(res => expect(res.body.supported_types).toHaveLength(itemsCount))

    // update with empty relations
    await request(suite.app.getHttpServer())
        .patch(`/api/${main_route}/${item.id}`)
        .set({ 'Authorization': `Bearer ${token}` })
        .send({ supported_types: [] })
        .expect(HttpStatus.OK)
        .expect(res => expect(res.body.supported_types).toHaveLength(0))
}

export let T_UpdateWithNonExistingRelations = async (suite: Suite) => {
    let token = await getValiduserToken(suite)
    let item: any = getRandomTransformation()

    //inserting item
    item = await suite.runner.manager.save(suite.runner.manager.create(Transformation, item))

    // update 
    await request(suite.app.getHttpServer())
        .patch(`/api/${main_route}/${item.id}`)
        .set({ 'Authorization': `Bearer ${token}` })
        .send({ supported_types: ['fake', 'fake2', 'fake3'] })
        .expect(HttpStatus.OK)
        .expect(res => expect(res.body.supported_types).toHaveLength(0))
        .expect(async res => {
            let count = await suite.runner.query(`SELECT COUNT(*) FROM ${main_table_relation} WHERE ${relation_id}=$1`, [res.body.id])
            count = parseInt(count[0].count)
            expect(count).toBe(0)
        })
}

export let T_CreateWithNonExistingRelations = async (suite: Suite) => {
    let token = await getValiduserToken(suite)
    let item: any = getRandomTransformation()
    item.supported_types = ['fake', 'fake2', 'fake3']

    await request(suite.app.getHttpServer())
        .post(`/api/${main_route}/`)
        .set({ 'Authorization': `Bearer ${token}` })
        .send(item)
        .expect(HttpStatus.CREATED)
        .expect(res => expect(res.body.supported_types).toHaveLength(0))
        .expect(async res => {
            let count = await suite.runner.query(`SELECT COUNT(*) FROM ${main_table_relation} WHERE ${relation_id}=$1`, [res.body.id])
            count = parseInt(count[0].count)
            expect(count).toBe(0)
        })
}

export let T_NoOrphanRelations = async (suite: Suite) => {
    let token = await getValiduserToken(suite)
    let item: any = getRandomTransformation()
    let itemsCount = 3
    item.supported_types = await getRandomFieldTypes(suite.runner, itemsCount)

    //inserting
    item = await suite.runner.manager.save(suite.runner.manager.create(Transformation, item))

    let count = await suite.runner.query(`SELECT COUNT(*) FROM ${main_table_relation} WHERE ${relation_id}=$1`, [item.id])
    count = parseInt(count[0].count)
    expect(count).toBe(itemsCount)

    await request(suite.app.getHttpServer())
        .delete(`/api/${main_route}/${item.id}`)
        .set({ 'Authorization': `Bearer ${token}` })
        .expect(HttpStatus.OK)
        .expect(async res => {
            let count = await suite.runner.query(`SELECT COUNT(*) FROM ${main_table_relation} WHERE ${relation_id}=$1`, [item.id])
            count = parseInt(count[0].count)
            expect(count).toBe(0)
        })
}