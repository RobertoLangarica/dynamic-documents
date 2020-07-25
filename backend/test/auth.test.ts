import { Suite, user1, user2, user3, randomUser, getValiduserToken } from "./test-utils"
import * as request from 'supertest'
import { HttpStatus } from "@nestjs/common"


export let NoTokenProfile = async (suite: Suite) => {
    await request(suite.app.getHttpServer())
        .get('/api/me')
        .expect(HttpStatus.FORBIDDEN)
}

export let NoTokenDelete = async (suite: Suite) => {
    await request(suite.app.getHttpServer())
        .delete('/api/logout')
        .expect(HttpStatus.FORBIDDEN)
}

export let UserCanSignUp = async (suite: Suite) => {
    return await request(suite.app.getHttpServer())
        .post('/api/signup')
        .send(user2)
        .expect(HttpStatus.CREATED)
}

export let NoDuplicatedSignup = async (suite: Suite) => {
    return await request(suite.app.getHttpServer())
        .post('/api/signup')
        .send(user2)
        .expect(HttpStatus.CONFLICT)
}

export let NoCredentialsSignup = async (suite: Suite) => {
    let user = randomUser()
    delete user.password
    await request(suite.app.getHttpServer())
        .post('/api/signup')
        .send(user)
        .expect(HttpStatus.UNPROCESSABLE_ENTITY)

    user = randomUser()
    delete user.email
    await request(suite.app.getHttpServer())
        .post('/api/signup')
        .send(user)
        .expect(HttpStatus.UNPROCESSABLE_ENTITY)
}

export let PasswordOmittedInSignupResponse = async (suite: Suite) => {
    await request(suite.app.getHttpServer())
        .post('/api/signup')
        .send(user3)
        .expect(HttpStatus.CREATED)
        .expect(res => expect(res.body).toMatchObject({ user: expect.any(Object) }))
        .expect(res => expect(res.body.user).not.toMatchObject({ password: expect.any(String) }))
}

export let UserCanLogin = async (suite: Suite) => {
    await request(suite.app.getHttpServer())
        .post('/api/login')
        .send(user3)
        .expect(HttpStatus.CREATED)
        .expect(res => expect(res.body).toMatchObject({ token: expect.any(String) }))
}

export let LoginWrongPassword = async (suite: Suite) => {
    let user: any = Object.assign({}, user1)
    user.password = 'wrong'
    await request(suite.app.getHttpServer())
        .post('/api/login')
        .send(user)
        .expect(HttpStatus.UNPROCESSABLE_ENTITY)
}

export let LoginWrongEmail = async (suite: Suite) => {
    let user: any = Object.assign({}, user1)
    user.email = 'wrong'
    await request(suite.app.getHttpServer())
        .post('/api/login')
        .send(user)
        .expect(HttpStatus.UNPROCESSABLE_ENTITY)
}

export let UserRetrieveProfile = async (suite: Suite) => {
    let token = await getValiduserToken(suite)

    await request(suite.app.getHttpServer())
        .get('/api/me')
        .set({ 'Authorization': `Bearer ${token}` })
        .expect(HttpStatus.OK)

    return token
}

export let ProfileWithNoPassword = async (suite: Suite) => {
    let token = await getValiduserToken(suite)

    await request(suite.app.getHttpServer())
        .get('/api/me')
        .set({ 'Authorization': `Bearer ${token}` })
        .expect(HttpStatus.OK)
        .expect(res => expect(res.body).not.toMatchObject({ password: expect.any(String) }))
}

export let UserCanLogout = async (suite: Suite) => {
    let token = await getValiduserToken(suite)

    await request(suite.app.getHttpServer())
        .delete('/api/logout')
        .set({ 'Authorization': `Bearer ${token}` })
        .expect(HttpStatus.OK)
}

export let ProfileAfterLogout = async (suite: Suite) => {
    let token = await getValiduserToken(suite)

    await request(suite.app.getHttpServer())
        .delete('/api/logout')
        .set({ 'Authorization': `Bearer ${token}` })
        .expect(HttpStatus.OK)

    await request(suite.app.getHttpServer())
        .get('/api/me')
        .set({ 'Authorization': `Bearer ${token}` })
        .expect(HttpStatus.FORBIDDEN)
}

export let LogoutAfterLogout = async (suite: Suite) => {
    let token = await getValiduserToken(suite)

    await request(suite.app.getHttpServer())
        .delete('/api/logout')
        .set({ 'Authorization': `Bearer ${token}` })
        .expect(HttpStatus.OK)

    await request(suite.app.getHttpServer())
        .delete('/api/logout')
        .set({ 'Authorization': `Bearer ${token}` })
        .expect(HttpStatus.FORBIDDEN)
}
