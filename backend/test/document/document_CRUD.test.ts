import * as request from 'supertest'
import { Suite, getValiduserToken } from '../test-utils'
import { HttpStatus } from '@nestjs/common'
import * as uuidv4 from 'uuid/v4'
import { plainToClass } from 'class-transformer'
import { Document } from 'src/document/document.entity'
import { Status } from 'src/status/status.entity'
import { DocumentConfig } from 'src/document/document.config'

const main_route = 'documents'
const main_table = 'documents'
let doc_initial_status

export let setDocumentsInitialStatus = async (suite: Suite) => {
    doc_initial_status = await suite.runner.manager.findOne(Status, { name: DocumentConfig.initialState })
}

const getRandomDocument = () => {
    return {
        name: `s_${Math.round(Math.random() * 999999999)}`,
        status: doc_initial_status
    }
}

export let addDocuments = async (suite: Suite) => {
    // Add some new entities
    let items = []

    for (let i = 10; i > 0; i--) {
        items.push(getRandomDocument())
    }
    await suite.runner.manager.save(suite.runner.manager.create(Document, items))
}

export let Doc_NoUserGetAll = async (suite: Suite) => {
    return await request(suite.app.getHttpServer())
        .get(`/api/${main_route}/`)
        .expect(HttpStatus.FORBIDDEN)
}

export let Doc_NoUserGetOne = async (suite: Suite) => {
    let uuid = uuidv4()
    return await request(suite.app.getHttpServer())
        .get(`/api/${main_route}/${uuid}`)
        .expect(HttpStatus.FORBIDDEN)
}

export let Doc_NoUserCreate = async (suite: Suite) => {
    return await request(suite.app.getHttpServer())
        .post(`/api/${main_route}/`)
        .expect(HttpStatus.FORBIDDEN)
}

export let Doc_NoUserUpdate = async (suite: Suite) => {
    let uuid = uuidv4()
    return await request(suite.app.getHttpServer())
        .patch(`/api/${main_route}/${uuid}`)
        .expect(HttpStatus.FORBIDDEN)
}

export let Doc_NoUserDelete = async (suite: Suite) => {
    let uuid = uuidv4()
    return await request(suite.app.getHttpServer())
        .delete(`/api/${main_route}/${uuid}`)
        .expect(HttpStatus.FORBIDDEN)
}

export let Doc_GetAll = async (suite: Suite) => {
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

export let Doc_GetAllEmpty = async (suite: Suite) => {
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

export let Doc_GetOne = async (suite: Suite) => {
    let token = await getValiduserToken(suite)

    // Pick a random one to be rerieved by the API
    let items = await suite.runner.manager.find(Document)
    let item = items[Math.floor((Math.random() * items.length))]

    await request(suite.app.getHttpServer())
        .get(`/api/${main_route}/${item.id}`)
        .set({ 'Authorization': `Bearer ${token}` })
        .expect(HttpStatus.OK)
        .expect(async res => expect(plainToClass(Document, res.body)).toEqual(plainToClass(Document, item)))
}

export let Doc_GetOneWrongID = async (suite: Suite) => {
    let token = await getValiduserToken(suite)
    let id = uuidv4()
    await request(suite.app.getHttpServer())
        .get(`/api/${main_route}/${id}`)
        .set({ 'Authorization': `Bearer ${token}` })
        .expect(HttpStatus.NOT_FOUND)
}

export let Doc_GetOneMalformedUUID = async (suite: Suite) => {
    let token = await getValiduserToken(suite)
    let id = 'wrong'
    await request(suite.app.getHttpServer())
        .get(`/api/${main_route}/${id}`)
        .set({ 'Authorization': `Bearer ${token}` })
        .expect(HttpStatus.UNPROCESSABLE_ENTITY)
}

export let Doc_UpdateWrongID = async (suite: Suite) => {
    let token = await getValiduserToken(suite)
    let id = uuidv4()
    await request(suite.app.getHttpServer())
        .patch(`/api/${main_route}/${id}`)
        .set({ 'Authorization': `Bearer ${token}` })
        .send({ name: 'new' })
        .expect(res => expect(res.status == HttpStatus.NOT_FOUND || res.status == HttpStatus.FORBIDDEN))
}

export let Doc_UpdateMalformedUUID = async (suite: Suite) => {
    let token = await getValiduserToken(suite)
    let id = 'wrong'
    await request(suite.app.getHttpServer())
        .patch(`/api/${main_route}/${id}`)
        .set({ 'Authorization': `Bearer ${token}` })
        .expect(res => expect(res.status == HttpStatus.UNPROCESSABLE_ENTITY || res.status == HttpStatus.FORBIDDEN))
}

export let Doc_UpdateDuplicatedName = async (suite: Suite) => {
    let token = await getValiduserToken(suite)
    let items = await suite.runner.manager.find(Document)
    let toUpdate = { name: items[1].name }
    let id = items[0].id

    await request(suite.app.getHttpServer())
        .patch(`/api/${main_route}/${id}`)
        .set({ 'Authorization': `Bearer ${token}` })
        .send(toUpdate)
        .expect(HttpStatus.CONFLICT)
}

export let Doc_Update = async (suite: Suite) => {
    let token = await getValiduserToken(suite)
    let item: any = getRandomDocument()

    // Insert
    item = await suite.runner.manager.save(suite.runner.manager.create(Document, item))

    // Update with new info
    let change = getRandomDocument()
    // status can´t be updated (but should be retrieved)
    delete change.status
    await request(suite.app.getHttpServer())
        .patch(`/api/${main_route}/${item.id}`)
        .set({ 'Authorization': `Bearer ${token}` })
        .send(change)
        .expect(HttpStatus.OK)
        .expect(res => {
            // the status should be reetrieevd
            change.status = item.status
            expect(res.body).toMatchObject(change)
        })
}

export let Doc_CreateIncomplete = async (suite: Suite) => {
    let token = await getValiduserToken(suite)
    let item = getRandomDocument()

    // Without name
    delete item.name
    await request(suite.app.getHttpServer())
        .post(`/api/${main_route}/`)
        .set({ 'Authorization': `Bearer ${token}` })
        .send(item)
        .expect(HttpStatus.UNPROCESSABLE_ENTITY)
}

export let Doc_Create = async (suite: Suite) => {
    let token = await getValiduserToken(suite)
    let item: any = getRandomDocument()

    //Status can´t be sent
    delete item.status
    await request(suite.app.getHttpServer())
        .post(`/api/${main_route}/`)
        .set({ 'Authorization': `Bearer ${token}` })
        .send(item)
        .expect(HttpStatus.CREATED)
        .expect(res => {
            //Status should be retrieved
            item.status = doc_initial_status
            expect(res.body).toMatchObject(item)
        })
}

export let Doc_CreateDuplicated = async (suite: Suite) => {
    let token = await getValiduserToken(suite)
    let item = getRandomDocument()

    // Insert
    await suite.runner.manager.save(suite.runner.manager.create(Document, item))

    // status can´t be sent
    delete item.status
    await request(suite.app.getHttpServer())
        .post(`/api/${main_route}/`)
        .set({ 'Authorization': `Bearer ${token}` })
        .send(item)
        .expect(HttpStatus.CONFLICT)
}

export let Doc_DeleteWrongID = async (suite: Suite) => {
    let token = await getValiduserToken(suite)
    let id = uuidv4()

    await request(suite.app.getHttpServer())
        .delete(`/api/${main_route}/${id}`)
        .set({ 'Authorization': `Bearer ${token}` })
        .expect(HttpStatus.NOT_FOUND)
}

export let Doc_DeleteMalformedUUID = async (suite: Suite) => {
    let token = await getValiduserToken(suite)
    let id = 'wrong'
    await request(suite.app.getHttpServer())
        .delete(`/api/${main_route}/${id}`)
        .set({ 'Authorization': `Bearer ${token}` })
        .expect(HttpStatus.UNPROCESSABLE_ENTITY)
}

export let Doc_Delete = async (suite: Suite) => {
    let token = await getValiduserToken(suite)
    let items = await suite.runner.manager.find(Document)
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
