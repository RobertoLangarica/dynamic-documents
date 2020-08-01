import * as request from 'supertest'
import { Suite, getValiduserToken } from '../../test-utils'
import { HttpStatus } from '@nestjs/common'
import { v4 as uuidv4 } from 'uuid'
import { Category } from 'src/categories/category.entity'

const main_route = 'categories'
const main_table = 'categories'

const getRandomCategory = () => {
    return {
        name: `c_${Math.round(Math.random() * 999999999)}`,
    }
}

export let addCategories = async (suite: Suite) => {
    // Add some new entities
    let items = []

    for (let i = 10; i > 0; i--) {
        items.push(getRandomCategory())
    }

    await suite.runner.manager.save(suite.runner.manager.create(Category, items))
}

export let C_NoUserGetAll = async (suite: Suite) => {
    return await request(suite.app.getHttpServer())
        .get(`/api/${main_route}/`)
        .expect(HttpStatus.FORBIDDEN)
}

export let C_NoUserGetOne = async (suite: Suite) => {
    let uuid = uuidv4()
    return await request(suite.app.getHttpServer())
        .get(`/api/${main_route}/${uuid}`)
        .expect(HttpStatus.FORBIDDEN)
}

export let C_NoUserCreate = async (suite: Suite) => {
    return await request(suite.app.getHttpServer())
        .post(`/api/${main_route}/`)
        .expect(HttpStatus.FORBIDDEN)
}

export let C_NoUserUpdate = async (suite: Suite) => {
    let uuid = uuidv4()
    return await request(suite.app.getHttpServer())
        .patch(`/api/${main_route}/${uuid}`)
        .expect(HttpStatus.FORBIDDEN)
}

export let C_NoUserDelete = async (suite: Suite) => {
    let uuid = uuidv4()
    return await request(suite.app.getHttpServer())
        .delete(`/api/${main_route}/${uuid}`)
        .expect(HttpStatus.FORBIDDEN)
}

export let C_GetAll = async (suite: Suite) => {
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

export let C_GetAllEmpty = async (suite: Suite) => {
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

export let C_GetOne = async (suite: Suite) => {
    let token = await getValiduserToken(suite)

    // Pick a random one to be rerieved by the API
    let items = await suite.runner.manager.find(Category)
    let item = items[Math.floor((Math.random() * items.length))]

    await request(suite.app.getHttpServer())
        .get(`/api/${main_route}/${item.id}`)
        .set({ 'Authorization': `Bearer ${token}` })
        .expect(HttpStatus.OK)
        .expect(res => expect(res.body).toEqual(item))
}

export let C_GetOneWrongID = async (suite: Suite) => {
    let token = await getValiduserToken(suite)
    let id = uuidv4()
    await request(suite.app.getHttpServer())
        .get(`/api/${main_route}/${id}`)
        .set({ 'Authorization': `Bearer ${token}` })
        .expect(HttpStatus.NOT_FOUND)
}

export let C_GetOneMalformedUUID = async (suite: Suite) => {
    let token = await getValiduserToken(suite)
    let id = 'wrong'
    await request(suite.app.getHttpServer())
        .get(`/api/${main_route}/${id}`)
        .set({ 'Authorization': `Bearer ${token}` })
        .expect(HttpStatus.UNPROCESSABLE_ENTITY)
}

export let C_UpdateWrongID = async (suite: Suite) => {
    let token = await getValiduserToken(suite)
    let id = uuidv4()
    await request(suite.app.getHttpServer())
        .patch(`/api/${main_route}/${id}`)
        .set({ 'Authorization': `Bearer ${token}` })
        .send({ name: 'new' })
        .expect(HttpStatus.NOT_FOUND)
}

export let C_UpdateMalformedUUID = async (suite: Suite) => {
    let token = await getValiduserToken(suite)
    let id = 'wrong'
    await request(suite.app.getHttpServer())
        .patch(`/api/${main_route}/${id}`)
        .set({ 'Authorization': `Bearer ${token}` })
        .expect(HttpStatus.UNPROCESSABLE_ENTITY)
}

export let C_UpdateDuplicatedName = async (suite: Suite) => {
    let token = await getValiduserToken(suite)
    let items = await suite.runner.manager.find(Category)
    let toUpdate = { name: items[1].name }
    let id = items[0].id

    await request(suite.app.getHttpServer())
        .patch(`/api/${main_route}/${id}`)
        .set({ 'Authorization': `Bearer ${token}` })
        .send(toUpdate)
        .expect(HttpStatus.CONFLICT)
}

export let C_Update = async (suite: Suite) => {
    let token = await getValiduserToken(suite)
    let item: any = getRandomCategory()

    // Insert
    item = await suite.runner.manager.save(suite.runner.manager.create(Category, item))

    // Update with new info
    let change = getRandomCategory()
    await request(suite.app.getHttpServer())
        .patch(`/api/${main_route}/${item.id}`)
        .set({ 'Authorization': `Bearer ${token}` })
        .send(change)
        .expect(HttpStatus.OK)
        .expect(res => expect(res.body).toMatchObject(change))
}

export let C_CreateIncomplete = async (suite: Suite) => {
    let token = await getValiduserToken(suite)
    let item = getRandomCategory()

    // Without name
    delete item.name
    await request(suite.app.getHttpServer())
        .post(`/api/${main_route}/`)
        .set({ 'Authorization': `Bearer ${token}` })
        .send(item)
        .expect(HttpStatus.UNPROCESSABLE_ENTITY)
}

export let C_Create = async (suite: Suite) => {
    let token = await getValiduserToken(suite)
    let item: any = getRandomCategory()

    await request(suite.app.getHttpServer())
        .post(`/api/${main_route}/`)
        .set({ 'Authorization': `Bearer ${token}` })
        .send(item)
        .expect(HttpStatus.CREATED)
        .expect(res => expect(res.body).toMatchObject(item))
}

export let C_CreateDuplicated = async (suite: Suite) => {
    let token = await getValiduserToken(suite)
    let item = getRandomCategory()

    // Insert
    await suite.runner.manager.save(suite.runner.manager.create(Category, item))

    await request(suite.app.getHttpServer())
        .post(`/api/${main_route}/`)
        .set({ 'Authorization': `Bearer ${token}` })
        .send(item)
        .expect(HttpStatus.CONFLICT)
}

export let C_DeleteWrongID = async (suite: Suite) => {
    let token = await getValiduserToken(suite)
    let id = uuidv4()

    await request(suite.app.getHttpServer())
        .delete(`/api/${main_route}/${id}`)
        .set({ 'Authorization': `Bearer ${token}` })
        .expect(HttpStatus.NOT_FOUND)
}

export let C_DeleteMalformedUUID = async (suite: Suite) => {
    let token = await getValiduserToken(suite)
    let id = 'wrong'
    await request(suite.app.getHttpServer())
        .delete(`/api/${main_route}/${id}`)
        .set({ 'Authorization': `Bearer ${token}` })
        .expect(HttpStatus.UNPROCESSABLE_ENTITY)
}

export let C_Delete = async (suite: Suite) => {
    let token = await getValiduserToken(suite)
    let items = await suite.runner.manager.find(Category)
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
