import * as request from 'supertest'
import { HttpStatus } from "@nestjs/common"
import { Suite, getValiduserToken } from './test-utils'
import { v4 as uuidv4 } from 'uuid'


const getRandomValidation = () => {
    return {
        name: `v_${Math.round(Math.random() * 999999999)}`,
        description: `d_${Math.round(Math.random() * 999999999)}`,
        action: `a_${Math.round(Math.random() * 999999999)}`,
        error_message: `error_${Math.round(Math.random() * 999999999)}`,
        parameters: {},
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

    console.log(await suite.runner.query('SELECT * from validations'))

    return await request(suite.app.getHttpServer())
        .get(`/api/validations/`)
        .set({ 'Authorization': `Bearer ${token}` })
        .expect(HttpStatus.OK)
        .expect(res => expect(res.body).toBe(Array))
}