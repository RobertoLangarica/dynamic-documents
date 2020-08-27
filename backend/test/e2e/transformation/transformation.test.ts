import * as request from 'supertest'
import { QueryRunner } from 'typeorm'
import { Suite, getValiduserToken } from '../../test-utils'
import { HttpStatus } from '@nestjs/common'
import { v4 as uuidv4 } from 'uuid'
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

export let addTransformationsWithRelations = async (suite: Suite) => {
    // Add some new transformations
    let items = []

    for (let i = 10; i > 0; i--) {
        let t: any = getRandomTransformation()
        t.description = DESCRIPTION_STR
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
    let items = await suite.runner.manager.find(Transformation)
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