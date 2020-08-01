import * as request from 'supertest'
import { Suite, getValiduserToken, user1 } from '../../test-utils'
import { HttpStatus } from '@nestjs/common'
import { v4 as uuidv4 } from 'uuid'
import { plainToClass } from 'class-transformer'
import { Document } from 'src/document/document.entity'
import { User } from 'src/user/user.entity'
import { DocumentFilter } from 'src/document_filter/doc_filter.entity'

const main_route = 'filters'
const main_table = 'document_filters'

const getRandomFilter = async (suite: Suite) => {
    return {
        name: `s_${Math.round(Math.random() * 999999999)}`,
        document: await getRandomDocumentID(suite),
        owner: await getUserID(suite)
    }
}

const getRandomDocumentID = async (suite: Suite) => {
    let docs = await suite.runner.manager.find(Document)
    return docs[Math.floor(Math.random() * docs.length)].id
}

const getUserID = async (suite: Suite) => {
    let user = await suite.runner.manager.findOne(User, { email: user1.email })
    return user.id
}

export let addFilters = async (suite: Suite) => {
    // Add some new entities
    let items = []

    for (let i = 10; i > 0; i--) {
        items.push(await getRandomFilter(suite))
    }

    return suite.runner.manager.save(suite.runner.manager.create(DocumentFilter, items))
}

export let DocF_NoUserGetAll = async (suite: Suite) => {
    return await request(suite.app.getHttpServer())
        .get(`/api/${main_route}/`)
        .expect(HttpStatus.FORBIDDEN)
}

export let DocF_NoUserGetOne = async (suite: Suite) => {
    let uuid = uuidv4()
    return await request(suite.app.getHttpServer())
        .get(`/api/${main_route}/${uuid}`)
        .expect(HttpStatus.FORBIDDEN)
}

export let DocF_NoUserCreate = async (suite: Suite) => {
    return await request(suite.app.getHttpServer())
        .post(`/api/${main_route}/`)
        .expect(HttpStatus.FORBIDDEN)
}

export let DocF_NoUserUpdate = async (suite: Suite) => {
    let uuid = uuidv4()
    return await request(suite.app.getHttpServer())
        .patch(`/api/${main_route}/${uuid}`)
        .expect(HttpStatus.FORBIDDEN)
}

export let DocF_NoUserDelete = async (suite: Suite) => {
    let uuid = uuidv4()
    return await request(suite.app.getHttpServer())
        .delete(`/api/${main_route}/${uuid}`)
        .expect(HttpStatus.FORBIDDEN)
}

export let DocF_NoUserExpire = async (suite: Suite) => {
    let uuid = uuidv4()
    return await request(suite.app.getHttpServer())
        .patch(`/api/${main_route}/${uuid}/expire`)
        .expect(HttpStatus.FORBIDDEN)
}

export let DocF_GetAll = async (suite: Suite) => {
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

export let DocF_GetAllEmpty = async (suite: Suite) => {
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

export let DocF_GetOne = async (suite: Suite) => {
    let token = await getValiduserToken(suite)

    // Pick a random one to be rerieved by the API
    let items = await suite.runner.manager.find(DocumentFilter)
    let item = items[Math.floor((Math.random() * items.length))]
    await request(suite.app.getHttpServer())
        .get(`/api/${main_route}/${item.id}`)
        .set({ 'Authorization': `Bearer ${token}` })
        .expect(HttpStatus.OK)
        .expect(async res => expect(plainToClass(DocumentFilter, res.body)).toEqual(plainToClass(DocumentFilter, item)))
}

export let DocF_GetOneWrongID = async (suite: Suite) => {
    let token = await getValiduserToken(suite)
    let id = uuidv4()
    await request(suite.app.getHttpServer())
        .get(`/api/${main_route}/${id}`)
        .set({ 'Authorization': `Bearer ${token}` })
        .expect(HttpStatus.NOT_FOUND)
}

export let DocF_GetOneMalformedUUID = async (suite: Suite) => {
    let token = await getValiduserToken(suite)
    let id = 'wrong'
    await request(suite.app.getHttpServer())
        .get(`/api/${main_route}/${id}`)
        .set({ 'Authorization': `Bearer ${token}` })
        .expect(HttpStatus.UNPROCESSABLE_ENTITY)
}

export let DocF_UpdateWrongID = async (suite: Suite) => {
    let token = await getValiduserToken(suite)
    let id = uuidv4()
    await request(suite.app.getHttpServer())
        .patch(`/api/${main_route}/${id}`)
        .set({ 'Authorization': `Bearer ${token}` })
        .send({ name: 'new' })
        .expect(HttpStatus.NOT_FOUND)
}

export let DocF_UpdateMalformedUUID = async (suite: Suite) => {
    let token = await getValiduserToken(suite)
    let id = 'wrong'
    await request(suite.app.getHttpServer())
        .patch(`/api/${main_route}/${id}`)
        .set({ 'Authorization': `Bearer ${token}` })
        .expect(HttpStatus.UNPROCESSABLE_ENTITY)
}

export let DocF_UpdateDuplicatedName = async (suite: Suite) => {
    let token = await getValiduserToken(suite)
    let items = await suite.runner.manager.find(DocumentFilter)
    let toUpdate = { name: items[1].name }
    let id = items[0].id

    await request(suite.app.getHttpServer())
        .patch(`/api/${main_route}/${id}`)
        .set({ 'Authorization': `Bearer ${token}` })
        .send(toUpdate)
        .expect(HttpStatus.CONFLICT)
}

export let DocF_Update = async (suite: Suite) => {
    let token = await getValiduserToken(suite)
    let item: any = await getRandomFilter(suite)

    // Insert
    item = await suite.runner.manager.save(suite.runner.manager.create(DocumentFilter, item))

    // Update with new info
    let change = await getRandomFilter(suite)
    //Owner shouldn't be sent
    delete change.owner
    await request(suite.app.getHttpServer())
        .patch(`/api/${main_route}/${item.id}`)
        .set({ 'Authorization': `Bearer ${token}` })
        .send(change)
        .expect(HttpStatus.OK)
        .expect(res => {
            // Owner should be retrieved
            change.owner = item.owner
            expect(res.body).toMatchObject(change)
        })
}

export let DocF_CreateIncomplete = async (suite: Suite) => {
    let token = await getValiduserToken(suite)
    let item = await getRandomFilter(suite)

    // Without name
    delete item.name
    await request(suite.app.getHttpServer())
        .post(`/api/${main_route}/`)
        .set({ 'Authorization': `Bearer ${token}` })
        .send(item)
        .expect(HttpStatus.UNPROCESSABLE_ENTITY)

    // Without document
    item = await getRandomFilter(suite)
    delete item.document
    await request(suite.app.getHttpServer())
        .post(`/api/${main_route}/`)
        .set({ 'Authorization': `Bearer ${token}` })
        .send(item)
        .expect(HttpStatus.UNPROCESSABLE_ENTITY)
}

export let DocF_Create = async (suite: Suite) => {
    let token = await getValiduserToken(suite)
    let item: any = await getRandomFilter(suite)

    //Owner shouldn't be sent
    let owner = item.owner
    delete item.owner
    await request(suite.app.getHttpServer())
        .post(`/api/${main_route}/`)
        .set({ 'Authorization': `Bearer ${token}` })
        .send(item)
        .expect(HttpStatus.CREATED)
        .expect(res => {
            // Owner should be retrieved
            item.owner = owner
            expect(res.body).toMatchObject(item)
        })
}

export let DocF_CreateDuplicated = async (suite: Suite) => {
    let token = await getValiduserToken(suite)
    let item = await getRandomFilter(suite)

    // Insert
    await suite.runner.manager.save(suite.runner.manager.create(DocumentFilter, item))

    //Owner shouldn't be sent
    delete item.owner
    await request(suite.app.getHttpServer())
        .post(`/api/${main_route}/`)
        .set({ 'Authorization': `Bearer ${token}` })
        .send(item)
        .expect(HttpStatus.CONFLICT)
}

export let DocF_DeleteWrongID = async (suite: Suite) => {
    let token = await getValiduserToken(suite)
    let id = uuidv4()

    await request(suite.app.getHttpServer())
        .delete(`/api/${main_route}/${id}`)
        .set({ 'Authorization': `Bearer ${token}` })
        .expect(HttpStatus.NOT_FOUND)
}

export let DocF_DeleteMalformedUUID = async (suite: Suite) => {
    let token = await getValiduserToken(suite)
    let id = 'wrong'
    await request(suite.app.getHttpServer())
        .delete(`/api/${main_route}/${id}`)
        .set({ 'Authorization': `Bearer ${token}` })
        .expect(HttpStatus.UNPROCESSABLE_ENTITY)
}

export let DocF_Delete = async (suite: Suite) => {
    let token = await getValiduserToken(suite)
    let items = await suite.runner.manager.find(DocumentFilter)
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

export let DocF_ExpireWrongID = async (suite: Suite) => {
    let token = await getValiduserToken(suite)
    let id = uuidv4()

    await request(suite.app.getHttpServer())
        .patch(`/api/${main_route}/${id}/expire`)
        .set({ 'Authorization': `Bearer ${token}` })
        .expect(HttpStatus.NOT_FOUND)
}

export let DocF_ExpireMalformedUUID = async (suite: Suite) => {
    let token = await getValiduserToken(suite)
    let id = 'wrong'
    await request(suite.app.getHttpServer())
        .patch(`/api/${main_route}/${id}/expire`)
        .set({ 'Authorization': `Bearer ${token}` })
        .expect(HttpStatus.UNPROCESSABLE_ENTITY)
}

export let DocF_Expire = async (suite: Suite) => {
    let token = await getValiduserToken(suite)
    let items = await suite.runner.manager.find(DocumentFilter)
    let item = items[Math.floor((Math.random() * items.length))]

    await request(suite.app.getHttpServer())
        .patch(`/api/${main_route}/${item.id}/expire`)
        .set({ 'Authorization': `Bearer ${token}` })
        .expect(HttpStatus.OK)

    await request(suite.app.getHttpServer())
        .get(`/api/${main_route}/${item.id}`)
        .set({ 'Authorization': `Bearer ${token}` })
        .expect(HttpStatus.OK)
        .expect(res => expect(res.body).toMatchObject({ expired: true }))
}
